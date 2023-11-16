import { Session } from "next-auth";
import { getTwitchClientToken } from "../auth/[...nextauth]/route";
import crypto from "crypto";
import { Glegoo } from "next/font/google";

export async function createRewardsSub(session: Session, id: string) {
    const thisUser = session.user;

    const appToken = await getTwitchClientToken();
    const eventSubCreateUrl = "https://api.twitch.tv/helix/eventsub/subscriptions";
    const headers = { Authorization: `Bearer ${appToken.access_token}`, "Client-Id": process.env.NEXT_PUBLIC_TWITCH_API_KEY, "Content-Type": "application/json" };
    const body = JSON.stringify({
        type: "channel.channel_points_custom_reward_redemption.add",
        version: "1",
        condition: { broadcaster_user_id: thisUser.providerAccountId, reward_id: id },
        transport: { method: "webhook", callback: process.env.NEXT_PUBLIC_REDIRECT_URL, secret: process.env.TWITCH_API_SECRET },
    });
    const result = await fetch(eventSubCreateUrl, { method: "POST", headers, body });
    const eventData = await result.json();
    return eventData;
}

// Build the message used to get the HMAC.
async function getHmacMessage(request: Request, rawMessage: string) {
    const messageId = request.headers.get("Twitch-Eventsub-Message-Id");
    const messageTimestamp = request.headers.get("Twitch-Eventsub-Message-Timestamp");
    if (messageId === null || messageTimestamp === null) return "";
    return messageId + messageTimestamp + rawMessage;
}

// Get the HMAC.
function getHmac(message: string) {
    const secret = process.env.TWITCH_API_SECRET;
    return crypto.createHmac("sha256", secret).update(message).digest("hex");
}

// Verify whether your signature matches Twitch's signature.
export async function verifyMessage(req: Request, rawMessage: string) {
    const message = "sha256=" + (await getHmacMessage(req, rawMessage));
    const hmac = getHmac(message);
    const verifySignature = req.headers.get("Twitch-Eventsub-Message-Signature");
    if (verifySignature === null) return false;
    console.log(hmac, verifySignature);
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(verifySignature));
}
