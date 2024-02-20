import { prisma } from "@/lib/prisma";
import QueueOperation from "./_DbQueue";

export async function addToDb({ giveawayId, creatorId, viewerId, viewerName }: { creatorId: string; giveawayId: string; viewerId: string; viewerName: string }) {
    console.log(giveawayId, creatorId, viewerId, viewerName);
    try {
        let viewer = await prisma.viewer.findFirst({ where: { twitchId: viewerId } });
        if (viewer) {
            if (viewer.name !== viewerName) {
                prisma.viewer.update({ where: { id: viewer.id }, data: { name: viewerName } });
            }
        } else {
            viewer = await prisma.viewer.create({ data: { name: viewerName, twitchId: viewerId, isBanned: false, isApproved: false } });
        }
        console.log(viewer);
        await QueueOperation(giveawayId, viewer.id);
        const r = await prisma.streamViewers.upsert({
            where: { UniqueViewerForCreator: { creatorId: creatorId, viewerId: viewer.id } },
            update: {},
            create: { creatorId: creatorId, viewerId: viewer.id },
        });
    } catch (error) {
        console.error(giveawayId, creatorId, viewerId, viewerName, error);
    }
}
