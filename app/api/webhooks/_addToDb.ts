import { prisma } from "@/lib/prisma";
import QueueOperation from "./_DbQueue";

export async function addToDb({ giveawayId, creatorId, viewerId, viewerName }: { creatorId: string; giveawayId: string; viewerId: string; viewerName: string }) {
    console.log(giveawayId, creatorId, viewerId, viewerName);
    try {
        const start = performance.now();
        let viewer = await prisma.viewer.findFirst({ where: { twitchId: viewerId } });
        if (viewer) {
            if (viewer.name !== viewerName) {
                prisma.viewer.update({ where: { id: viewer.id }, data: { name: viewerName } });
            }
        } else {
            viewer = await prisma.viewer.create({ data: { name: viewerName, twitchId: viewerId, isBanned: false, isApproved: false } });
        }
        console.log("Viewer: ", viewer, "Time to queue:", performance.now() - start);
        await QueueOperation(giveawayId, viewer.id);
        const t2 = performance.now();
        const r = await prisma.streamViewers.upsert({
            where: { UniqueViewerForCreator: { creatorId: creatorId, viewerId: viewer.id } },
            update: {},
            create: { creatorId: creatorId, viewerId: viewer.id },
        });
        console.log("Stream viewer insert time:", performance.now() - t2);
    } catch (error) {
        console.error(giveawayId, creatorId, viewerId, viewerName, error);
    }
}
