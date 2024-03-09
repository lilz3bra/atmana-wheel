import { prisma } from "@/lib/prisma";
import { inngest } from "../inngest.client";

interface CountMap {
    [key: string]: { viewerId: string; giveawayId: string; creatorId: string; viewerName: string; count: number };
}

export const streamViewers = inngest.createFunction({ id: "streamViewers", name: "Viewers on stream" }, { event: "webhook.claim" }, async ({ event, step }) => {
    const result = await step.run("record data to DB", async () => {
        try {
            let viewer = await prisma.viewer.findFirst({ where: { twitchId: event.data.viewerId }, select: { id: true, name: true } });
            if (viewer) {
                if (viewer.name !== event.data.viewerName) {
                    await prisma.viewer.update({ where: { id: viewer.id }, data: { name: event.data.viewerName } });
                }
            } else {
                viewer = await prisma.viewer.create({ data: { name: event.data.viewerName, twitchId: event.data.viewerId, isBanned: false, isApproved: false } });
            }
            await prisma.streamViewers.upsert({
                where: { UniqueViewerForCreator: { creatorId: event.data.creatorId, viewerId: viewer.id } },
                update: {},
                create: { creatorId: event.data.creatorId, viewerId: viewer.id },
            });

            const redemption = await prisma.giveawayRedemptions.upsert({
                where: { ViewerRedemptions: { viewerId: viewer.id, giveawayId: event.data.giveawayId } },
                update: { ammount: { increment: event.data.count } },
                create: { viewerId: viewer.id, giveawayId: event.data.giveawayId },
            });
            return redemption;
        } catch (err: any) {
            console.error("Error inserting:", event.data, err);
            throw new Error(err);
        }
    });
    return { success: true, recorded: result };
});
