import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    const secret = process.env.TWITCH_API_SECRET; //process.env.NEXT_PUBLIC_API_KEY;

    // const message = getHmacMessage(req);

    // const hmac = HMAC_PREFIX + getHmac(secret, message);

    // console.log(req);
    const msg = await req.text();
    console.log(msg);
    return NextResponse.json({}, { status: 200 });
}

export async function PUT(req: Request) {
    const secret = process.env.TWITCH_API_SECRET;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const thisUser = session.user;

    const eventSubCreateUrl = "https://api.twitch.tv/helix/eventsub/subscriptions";
    const headers = { Authorization: `Bearer ${thisUser.access_token}`, "Client-Id": process.env.NEXT_PUBLIC_TWITCH_API_KEY };
    const body = JSON.stringify({
        type: "channel.channel_points_custom_reward_redemption.add",
        version: "1",
        condition: { broadcaster_user_id: thisUser.providerAccountId },
        transport: { method: "webhook", callback: process.env.NEXT_PUBLIC_REDIRECT_URL, secret: process.env.TWITCH_API_SECRET },
    });
    const result = await fetch(eventSubCreateUrl, { headers, body });
    const data = await result.json();
    return NextResponse.json(data);
}
