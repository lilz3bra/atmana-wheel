import { JWT } from "next-auth/jwt";
import { refreshAccessToken } from "./refreshAccessToken";

export async function validateToken(token: JWT): Promise<JWT> {
    const response = await fetch("https://id.twitch.tv/oauth2/validate ", {
        method: "GET",
        headers: { Authorization: `OAuth ${token.access_token}` },
    });
    const j = await response.json();
    if (!j.login) {
        return refreshAccessToken(token);
    } else {
        return { ...token, validate_time: Date.now() + 3600000 };
    }
}
