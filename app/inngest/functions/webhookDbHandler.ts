import { prisma } from "@/lib/prisma";
import { inngest } from "../inngest.client";
import QueueOperation from "@/api/webhooks/_DbQueue";

export const streamViewers = inngest.createFunction({ id: "streamViewers", name: "Viewers on stream" }, { event: "webhook.claim" }, async ({ event, step }) => {
    const creatorId: string = event.data.creatorId;
    const giveawayId: string = event.data.giveawayId;
    const viewerId: string = event.data.viewerId;
    const viewerName: string = event.data.viewerName;

    const viewer = await step.run("fetch-viewer", async () => {
        const v = await prisma.viewer.findFirst({ where: { twitchId: viewerId } });
        if (v) {
            if (v.name !== viewerName) {
                await prisma.viewer.update({ where: { id: v.id }, data: { name: viewerName } });
            }
            return v;
        } else {
            const vi = await prisma.viewer.create({ data: { name: viewerName, twitchId: viewerId, isBanned: false, isApproved: false } });
            return vi;
        }
    });

    if (viewer) {
        const viewerOnStream = step.run("upsert-viewer-on-stream", async () => {
            return await prisma.streamViewers.upsert({
                where: { UniqueViewerForCreator: { creatorId: creatorId, viewerId: viewer.id } },
                update: {},
                create: { creatorId: creatorId, viewerId: viewer.id },
            });
        });
        const redemption = step.run("insert-redemption", async () => {
            return await prisma.giveawayRedemptions.upsert({
                where: { ViewerRedemptions: { viewerId: viewer.id, giveawayId: giveawayId } },
                update: { ammount: { increment: 1 } },
                create: { viewerId: viewer.id, giveawayId: giveawayId },
            });
        });
        const [createdVoS, createdRedemption] = await Promise.all([viewerOnStream, redemption]);
        return { createdVoS, createdRedemption };
    }
});
