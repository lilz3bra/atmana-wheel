import { prisma } from "@/lib/prisma";
import { inngest } from "../inngest.client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const streamViewers = inngest.createFunction({ id: "streamVievers", name: "Viewers on stream" }, { event: "viewer/addViewerOnStream" }, async ({ event, step }) => {
    console.log(event.data.v);
    const creator: string = event.data.creator;
    const viewer: string = event.data.viewer;
    try {
        const res = await prisma.streamViewers.create({ data: { creatorId: creator, viewerId: viewer } });
        return { event, body: res };
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) return;
        else {
            console.log(error);
            return { event, body: error };
        }
    }
});
