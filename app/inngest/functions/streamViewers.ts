import { prisma } from "@/lib/prisma";
import { inngest } from "../inngest.client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const streamViewers = inngest.createFunction({ id: "streamVievers", name: "Viewers on stream" }, { event: "viewer/addViewerOnStream" }, async ({ event, step }) => {
    console.log(event.data.v);
    const creatorId: string = event.data.creatorId;
    const giveawayId: string = event.data.giveawayId;
    const viewerId: string = event.data.viewerId;
    const viewerName: string = event.data.viewerName;

    try {
        const viewer = await prisma.viewer.upsert({
            where: { twitchId: viewerId },
            update: { name: viewerName },
            create: { name: viewerName, twitchId: viewerId, isBanned: false, isApproved: false },
        });
        await prisma.giveawayRedemptions.upsert({
            where: { ViewerRedemptions: { viewerId: viewer.id, giveawayId: giveawayId } },
            update: { ammount: { increment: 1 } },
            create: { viewerId: viewer.id, giveawayId: giveawayId },
        });
        await prisma.streamViewers.upsert({
            where: { UniqueViewerForCreator: { creatorId: creatorId, viewerId: viewerId } },
            update: {},
            create: { creatorId: creatorId, viewerId: viewer.id },
        });
        return { event, body: `Successfully inserted ${viewerName}'s redemption` };
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) return;
        else {
            console.log(error);
            return { event, body: error };
        }
    }
});
