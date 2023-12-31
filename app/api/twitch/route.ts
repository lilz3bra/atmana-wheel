import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_API_KEY;

    const TWITCH_SECRET = process.env.TWITCH_API_SECRET;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URL;
    const { code } = await request.json();
    if (code) {
        const body = new URLSearchParams();
        body.append("client_id", CLIENT_ID);
        body.append("client_secret", TWITCH_SECRET);
        body.append("code", code);
        body.append("grant_type", "authorization_code");
        body.append("redirect_uri", REDIRECT_URI);

        const sendData = {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
        };
        const response = await fetch("https://id.twitch.tv/oauth2/token", sendData);
        const data = await response.json();
        const sendRes = NextResponse.json({ response: "ok" });
        sendRes.cookies.set({ name: "access_token", value: data.access_token, maxAge: data.expires_in });
        sendRes.cookies.set({ name: "refresh_token", value: data.refresh_token, maxAge: 60 * 60 * 24 * 365 });
        return sendRes;
    } else {
        return NextResponse.json({ error: "Something went wrong" }, { status: 403 });
    }
}
