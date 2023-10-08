import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    const access_token = cookies().get("access_token");
    if (access_token) {
        const preparedBody = new URLSearchParams({ client_id: process.env.NEXT_PUBLIC_TWITCH_API_KEY, token: access_token.value });
        const response = await fetch("https://id.twitch.tv/oauth2/revoke", { method: "POST", body: preparedBody });
        const sendRes = NextResponse.json(await response.json());
        sendRes.cookies.delete("access_token");
        sendRes.cookies.delete("refresh_token");
        return sendRes;
    } else return NextResponse.json({ message: "bad Request" }, { status: 400 });
}
