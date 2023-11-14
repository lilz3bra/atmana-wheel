import { Session } from "next-auth";
import { getTwitchClientToken } from "../auth/[...nextauth]/route";

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
}
