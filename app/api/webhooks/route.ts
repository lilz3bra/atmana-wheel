import { Session, getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions, getTwitchClientToken } from "../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    const secret = process.env.TWITCH_API_SECRET; //process.env.NEXT_PUBLIC_API_KEY;

    // const message = getHmacMessage(req);

    // const hmac = HMAC_PREFIX + getHmac(secret, message);

    // console.log(req);
    const msg = await req.text();
    console.log(msg);
    return NextResponse.json({}, { status: 200 });
}

/** Creates an eventsub */
export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const eventData = await createRewardsSub(session);
    return NextResponse.json(eventData);
}

export async function createRewardsSub(session: Session) {
    const thisUser = session.user;

    const appToken = await getTwitchClientToken();
    const eventSubCreateUrl = "https://api.twitch.tv/helix/eventsub/subscriptions";
    const headers = { Authorization: `Bearer ${appToken.access_token}`, "Client-Id": process.env.NEXT_PUBLIC_TWITCH_API_KEY, "Content-Type": "application/json" };
    const body = JSON.stringify({
        type: "channel.channel_points_custom_reward_redemption.add",
        version: "1",
        condition: { broadcaster_user_id: thisUser.providerAccountId },
        transport: { method: "webhook", callback: process.env.NEXT_PUBLIC_REDIRECT_URL, secret: process.env.TWITCH_API_SECRET },
    });
    console.log(body);

    const result = await fetch(eventSubCreateUrl, { method: "POST", headers, body });
    const eventData = await result.json();
    console.log(eventData);
    return eventData;
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
