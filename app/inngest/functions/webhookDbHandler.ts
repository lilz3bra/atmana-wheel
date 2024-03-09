import { prisma } from "@/lib/prisma";
import { inngest } from "../inngest.client";

interface CountMap {
    [key: string]: { viewerId: string; giveawayId: string; creatorId: string; viewerName: string; count: number };
}

export const streamViewers = inngest.createFunction(
    { id: "streamViewers", name: "Viewers on stream", batchEvents: { maxSize: 30, timeout: "5s" } },
    { event: "webhook.claim" },
    async ({ events, step }) => {
        const data = events.reduce((acc, item) => {
            const { viewerName, viewerId, giveawayId, creatorId } = item.data;
            const key = `${viewerId}_${giveawayId}`;
            acc[key] = acc[key] || { viewerId, giveawayId, creatorId, viewerName, count: 0 };
            acc[key].count++;
            return acc;
        }, {} as CountMap);

        const result = await step.run("record data to DB", async () => {
            Object.entries(data).forEach(async ([key, entry]) => {
                try {
                    let viewer = await prisma.viewer.findFirst({ where: { twitchId: entry.viewerId }, select: { id: true, name: true } });
                    if (viewer) {
                        if (viewer.name !== entry.viewerName) {
                            await prisma.viewer.update({ where: { id: viewer.id }, data: { name: entry.viewerName } });
                        }
                    } else {
                        viewer = await prisma.viewer.create({ data: { name: entry.viewerName, twitchId: entry.viewerId, isBanned: false, isApproved: false } });
                    }
                    await prisma.streamViewers.upsert({
                        where: { UniqueViewerForCreator: { creatorId: entry.creatorId, viewerId: viewer.id } },
                        update: {},
                        create: { creatorId: entry.creatorId, viewerId: viewer.id },
                    });

                    const redemption = await prisma.giveawayRedemptions.upsert({
                        where: { ViewerRedemptions: { viewerId: viewer.id, giveawayId: entry.giveawayId } },
                        update: { ammount: { increment: entry.count } },
                        create: { viewerId: viewer.id, giveawayId: entry.giveawayId },
                    });
                    console.log(redemption);
                    return redemption;
                } catch (err: any) {
                    console.error("Error inserting:", entry, err);
                    throw new Error(err);
                }
            });
        });
        return { success: true, recorded: result };
    }
);
