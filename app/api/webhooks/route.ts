import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions, getTwitchClientToken } from "../auth/[...nextauth]/route";
import { verifyMessage } from "./_helpers";
import { prisma } from "@/lib/prisma";
// import { inngest } from "@/inngest/inngest.client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function POST(req: Request) {
    const msg = await req.text();
    const data = await JSON.parse(msg);
    if (data.subscription.status === "webhook_callback_verification_pending") {
        return new Response(data.challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
    } else {
        if (await verifyMessage(req, msg)) {
            const giveaway = await prisma.giveaways.findFirst({ where: { twitchId: data.event.reward.id }, select: { id: true, creatorId: true } });
            if (giveaway) {
                console.log("Started asyc job", performance.now());

                addToQueue({
                    giveawayId: giveaway.id,
                    creatorId: giveaway.creatorId,
                    viewerId: data.event.user_id,
                    viewerName: data.event.user_name,
                });
                console.log("Sending response", performance.now());
                return NextResponse.json({}, { status: 200 });
            } else {
                console.log("Invalid giveaway requested");
                return NextResponse.json({}, { status: 403 });
            }
        }
        console.log("Invalid message received");
        return NextResponse.json({}, { status: 403 });
    }
}

async function addToQueue({ giveawayId, creatorId, viewerId, viewerName }: { creatorId: string; giveawayId: string; viewerId: string; viewerName: string }) {
    // console.log(event.data.v);
    // const creatorId: string = event.data.creatorId;
    // const giveawayId: string = event.data.giveawayId;
    // const viewerId: string = event.data.viewerId;
    //  const viewerName: string = event.data.viewerName;

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
            where: { UniqueViewerForCreator: { creatorId: creatorId, viewerId: viewer.id } },
            update: {},
            create: { creatorId: creatorId, viewerId: viewer.id },
        });
        console.log("Finished async job", performance.now());

        return;
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) return;
        else {
            console.log(error);
            return { event, body: error };
        }
    }
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");

    const appToken = await getTwitchClientToken();
    const eventSubUrl = `https://api.twitch.tv/helix/eventsub/subscriptions?id=${id}`;
    const headers = { Authorization: `Bearer ${appToken.access_token}`, "Client-Id": process.env.NEXT_PUBLIC_TWITCH_API_KEY };
    const result = await fetch(eventSubUrl, { method: "GET", headers });
    const data = await result.json();
    return NextResponse.json(data, { status: result.status === 204 ? 200 : result.status });
}
