import React, { useState } from "react";

const TwitchConnect = ({ user }: any) => {
    const [response, setResponse] = useState(false);
    const [loading, setLoading] = useState(false);
    const [twitchAuth, setTwitchAuth] = useState(false);
    const client_id = process.env.NEXT_PUBLIC_TWITCH_API_KEY;
    const REDIRECT_URL = process.env.NEXT_PUBLIC_REDIRECT_URL;
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const handleTwitchAuth = () => {
        setLoading(true);

        const redirect_uri = `${REDIRECT_URL}/twitch`;
        const scope = "channel:manage:redemptions";
        const twitchAuthUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}`;
        const authWindow = window.open(twitchAuthUrl, "_blank", "width=500,height=600");

        const pollAuthWindow = setInterval(() => {
            if (authWindow?.closed) {
                clearInterval(pollAuthWindow);
                return;
            }
            const receiveMessage = (event: any) => {
                // Check if the message came from the popup window
                if (event.origin !== window.location.origin) return;
                // Check if the message contains the data we need
                if (event.data.access_token && event.data.refresh_token) {
                    // Close the popup window
                    authWindow?.close();
                    setResponse(true);
                    setLoading(false);
                    setTwitchAuth(true);
                    getTwitchUser(event.data.access_token);
                }
            };

            window.addEventListener("message", receiveMessage, false);
        }, 1000);
    };

    // const handleTwitchAuth = async () => {
    //     const access_token = JSON.stringify({ asd: "kajshdklajshdkajsh" });
    //     const res = await fetch(`${BACKEND_URL}/twitch/`, { method: "POST", body: access_token });
    //     const data = await res.json();
    //     console.log(data);
    //     if (data.login) {
    //         window.localStorage.setItem("twitchUser", data.login);
    //     }
    // };

    const handleTwitchDeauth = () => {};

    const getTwitchUser = async (access_token: string) => {
        // const res = await fetch(`${BACKEND_URL}/twitch/`, { method: "POST", body: access_token });
        // const data = await res.json();
        // if (data.login) {
        //     window.localStorage.setItem("twitchUser", data.login);
        // }
    };
    return (
        <button onClick={response || twitchAuth ? handleTwitchDeauth : handleTwitchAuth} disabled={loading} className="cursor-pointer">
            {response || twitchAuth ? "Disconnect from" : "Connect with"} Twitch
        </button>
    );
};

export default TwitchConnect;
