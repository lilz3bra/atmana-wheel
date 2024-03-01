import { JWT } from "next-auth/jwt";

export async function refreshAccessToken(token: JWT): Promise<JWT> {
    const data = new FormData();
    data.append("client_id", process.env.NEXT_PUBLIC_TWITCH_API_KEY);
    data.append("client_secret", process.env.TWITCH_API_SECRET);
    data.append("grant_type", "refresh_token");
    data.append("refresh_token", token.refresh_token as string);
    try {
        const response = await fetch("https://id.twitch.tv/oauth2/token ", {
            method: "POST",
            body: data,
        });
        const j = await response.json();
        return {
            ...token,
            access_token: j.access_token,
            validate_time: Date.now() + 3600000,
            refreshToken: j.refresh_token,
        };
    } catch (error) {
        return { ...token, error: "Refresh Token Error" };
    }
}
