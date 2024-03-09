import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { getTwitchClientToken } from "@/lib/getTwitchClientToken";
import { verifyMessage } from "./_helpers";
import { prisma } from "@/lib/prisma";
import { Inngest } from "inngest";

let gaQueue: Record<string, { id: string; creatorId: string }> = {};

export async function POST(req: Request) {
    const msg = await req.text();
    const data = await JSON.parse(msg);
    if (data.subscription.status === "webhook_callback_verification_pending") {
        return new Response(data.challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
    } else {
        if (await verifyMessage(req, msg)) {
            let giveaway;
            if (data.event.reward.id in gaQueue) {
                giveaway = { id: gaQueue[data.event.reward.id].id, creatorId: gaQueue[data.event.reward.id].creatorId };
            } else {
                giveaway = await prisma.giveaways.findFirst({ where: { twitchId: data.event.reward.id }, select: { id: true, creatorId: true } });
                if (giveaway) gaQueue[data.event.reward.id] = { id: giveaway.id, creatorId: giveaway.creatorId };
            }
            if (giveaway) {
                const inngest = new Inngest({ id: "atmana" });
                await inngest.send({
                    name: "webhook.claim",
                    data: {
                        giveawayId: giveaway.id,
                        creatorId: giveaway.creatorId,
                        viewerId: data.event.user_id,
                        viewerName: data.event.user_name,
                    },
                });
                return NextResponse.json({}, { status: 200 });
            } else {
                console.error("Invalid giveaway requested");
                return NextResponse.json({}, { status: 403 });
            }
        }
        console.error("Invalid message received");
        return NextResponse.json({}, { status: 403 });
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
