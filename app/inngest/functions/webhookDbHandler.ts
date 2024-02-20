import { prisma } from "@/lib/prisma";
import { inngest } from "../inngest.client";
import QueueOperation from "@/api/webhooks/_DbQueue";

export const streamViewers = inngest.createFunction({ id: "streamViewers", name: "Viewers on stream" }, { event: "viewer/addViewerOnStream" }, async ({ event, step }) => {
    const creatorId: string = event.data.creatorId;
    const giveawayId: string = event.data.giveawayId;
    const viewerId: string = event.data.viewerId;
    const viewerName: string = event.data.viewerName;
    try {
        const start = performance.now();
        // Look for the viewer
        let viewer = await prisma.viewer.findFirst({ where: { twitchId: viewerId } });
        console.log("Viewer before checks:", viewer);
        if (viewer) {
            // Viewer was found, have they updated their name?
            if (viewer.name !== viewerName) {
                const updated = await prisma.viewer.update({ where: { id: viewer.id }, data: { name: viewerName } });
                await QueueOperation(giveawayId, updated.id);
            }
            await prisma.streamViewers.upsert({
                where: { UniqueViewerForCreator: { creatorId: creatorId, viewerId: viewer.id } },
                update: {},
                create: { creatorId: creatorId, viewerId: viewer.id },
            });
        } else {
            // Viewer didnt exist, we should create it
            const newViewer = await prisma.viewer.create({ data: { name: viewerName, twitchId: viewerId, isBanned: false, isApproved: false } });
            await QueueOperation(giveawayId, newViewer.id);
            await prisma.streamViewers.upsert({
                where: { UniqueViewerForCreator: { creatorId: creatorId, viewerId: newViewer.id } },
                update: {},
                create: { creatorId: creatorId, viewerId: newViewer.id },
            });
        }
        console.log("Viewer: ", viewer, "Time to queue:", performance.now() - start);
    } catch (error) {
        console.error(giveawayId, creatorId, viewerId, viewerName, error);
    }
});
