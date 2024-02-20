import { prisma } from "@/lib/prisma";
import QueueOperation from "./_DbQueue";

export async function addToDb({ giveawayId, creatorId, viewerId, viewerName }: { creatorId: string; giveawayId: string; viewerId: string; viewerName: string }) {
    console.log(giveawayId, creatorId, viewerId, viewerName);
    try {
        const viewer = await prisma.viewer.upsert({
            where: { twitchId: viewerId },
            update: { name: viewerName },
            create: { name: viewerName, twitchId: viewerId, isBanned: false, isApproved: false },
        });
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
