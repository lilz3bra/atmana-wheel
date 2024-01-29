import { Session } from "next-auth";
import { getTwitchClientToken } from "../auth/[...nextauth]/route";
import crypto from "crypto";

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
    const message = await getHmacMessage(req, rawMessage);
    const hmac = "sha256=" + getHmac(message);
    const verifySignature = req.headers.get("Twitch-Eventsub-Message-Signature");
    if (verifySignature === null) return false;

    // Check the timestamp validity
    const tStamp = req.headers.get("Twitch-Eventsub-Message-Timestamp");
    const webhookDate = new Date(tStamp!);
    const currentDate = new Date();

    // Calculate the difference in milliseconds
    const timeDifference = currentDate.getTime() - webhookDate.getTime();

    // Check if the time difference is less than 10 minutes (600,000 milliseconds)
    if (timeDifference < 600000) return false;

    try {
        return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(verifySignature));
    } catch (error) {
        // In case somehow HMACs dont match in lenght, we fail the verification of the message
        return false;
    }
}

export async function deleteListener(id: string) {
    const appToken = await getTwitchClientToken();
    const eventSubCreateUrl = `https://api.twitch.tv/helix/eventsub/subscriptions?id=${id}`;
    const headers = { Authorization: `Bearer ${appToken.access_token}`, "Client-Id": process.env.NEXT_PUBLIC_TWITCH_API_KEY };
    const result = await fetch(eventSubCreateUrl, { method: "DELETE", headers });
    return result.status;
}
