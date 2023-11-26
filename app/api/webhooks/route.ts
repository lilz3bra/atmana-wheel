import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions, getTwitchClientToken } from "../auth/[...nextauth]/route";
import { verifyMessage } from "./helpers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const msg = await req.text();
    const data = await JSON.parse(msg);
    if (data.subscription.status === "webhook_callback_verification_pending") {
        return new Response(data.challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
    } else {
        if (await verifyMessage(req, msg)) {
            const viewer = await prisma.viewer.upsert({
                where: { twitchId: data.event.user_id },
                update: {},
                create: { name: data.event.user_name, twitchId: data.event.user_id, isBanned: false, isApproved: false },
            });
            const giveaway = await prisma.giveaways.findFirst({ where: { twitchId: data.event.reward.id }, select: { id: true, creatorId: true } });
            const viewerOnStream = await prisma.viewerOnStream.upsert({
                where: {
                    UniqueViewerOnStream: {
                        streamerId: giveaway?.creatorId!,
                        viewerId: viewer.id!,
                    },
                },
                update: {},
                create: { streamerId: giveaway?.creatorId!, viewerId: viewer.id },
            });
            const result = await prisma.giveawayRedemptions.create({ data: { viewerId: viewer.id!, redeemedAt: data.event.redeemed_at, giveawayId: giveaway?.id! } });
            return NextResponse.json({}, { status: 200 });
        }
        console.log("Invalid message received");
        return NextResponse.json({}, { status: 403 });
    }
}

/** Deletes an eventusb */
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");

    const appToken = await getTwitchClientToken();
    const eventSubCreateUrl = `https://api.twitch.tv/helix/eventsub/subscriptions?id=${id}`;
    const headers = { Authorization: `Bearer ${appToken.access_token}`, "Client-Id": process.env.NEXT_PUBLIC_TWITCH_API_KEY };
    const result = await fetch(eventSubCreateUrl, { method: "DELETE", headers });
    return NextResponse.json({}, { status: result.status === 204 ? 200 : result.status });
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");

    const appToken = await getTwitchClientToken();
    const eventSubCreateUrl = `https://api.twitch.tv/helix/eventsub/subscriptions?id=${id}`;
    const headers = { Authorization: `Bearer ${appToken.access_token}`, "Client-Id": process.env.NEXT_PUBLIC_TWITCH_API_KEY };
    const result = await fetch(eventSubCreateUrl, { method: "GET", headers });
    const data = await result.json();
    return NextResponse.json(data, { status: result.status === 204 ? 200 : result.status });
}
