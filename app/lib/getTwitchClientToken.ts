import { TwitchToken } from "@/api/auth/[...nextauth]/route";

export async function getTwitchClientToken(): Promise<TwitchToken> {
    const getCreds = await fetch(
        `https://id.twitch.tv/oauth2/token?client_id=${process.env.NEXT_PUBLIC_TWITCH_API_KEY}&client_secret=${process.env.TWITCH_API_SECRET}&grant_type=client_credentials`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
    );
    const creds: TwitchToken = await getCreds.json();
    return creds;
}
