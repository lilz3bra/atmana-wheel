import { prisma } from "@/lib/prisma";
import QueueOperation from "./_DbQueue";

export async function addToDb({ giveawayId, creatorId, viewerId, viewerName }: { creatorId: string; giveawayId: string; viewerId: string; viewerName: string }) {
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
}
