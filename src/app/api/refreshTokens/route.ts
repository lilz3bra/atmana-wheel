import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    const refresh_token = cookies().get("refresh_token");
    if (refresh_token) {
        const preparedBody = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_TWITCH_API_KEY,
            client_secret: process.env.TWITCH_API_SECRET,
            grant_type: "refresh_token",
            refresh_token: refresh_token.value,
        });
        const response = await fetch("https://id.twitch.tv/oauth2/revoke", { method: "POST", body: preparedBody });
        let sendRes;
        if (response.status === 200) {
            sendRes = NextResponse.json({}, { status: 200 });
            const resJson = await response.json();
            sendRes.cookies.set({ name: "access_token", value: resJson.access_token, maxAge: resJson.expires_in });
            sendRes.cookies.set({ name: "refresh_token", value: resJson.refresh_token, maxAge: 60 * 60 * 24 * 365 });
        } else {
            sendRes = NextResponse.json({}, { status: 401 });
        }
        return sendRes;
    } else return NextResponse.json({ message: "bad Request" }, { status: 400 });
}
