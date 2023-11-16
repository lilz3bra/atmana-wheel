import { Session, getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions, getTwitchClientToken } from "../auth/[...nextauth]/route";
import { verifyMessage } from "./helpers";

export async function POST(req: Request) {
    const secret = process.env.TWITCH_API_SECRET; //process.env.NEXT_PUBLIC_API_KEY;

    // const message = getHmacMessage(req);

    // const hmac = HMAC_PREFIX + getHmac(secret, message);

    // console.log(req);
    const msg = await req.text();
    // console.log(msg);
    const data = await JSON.parse(msg);
    if (data.subscription.status === "webhook_callback_verification_pending") {
        console.log("Verification happening");
        return new Response(data.challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
    } else {
        if (await verifyMessage(req, msg)) {
            // TODO: parse message
            // TODO: save data to db
            console.log("Valid message received");
            console.log(msg);
            return NextResponse.json({}, { status: 200 });
        }
        return NextResponse.json({}, { status: 403 });
    }
}

/** Creates an eventsub */
export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // const eventData = await createRewardsSub(session);
    // return NextResponse.json(eventData);
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
