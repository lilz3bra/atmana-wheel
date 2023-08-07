import React, { useEffect, useState } from "react";
import { hasCookie, getCookies } from "cookies-next";
import { faTwitch } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const TwitchConnect = ({ user }: any) => {
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

        const loginListener = setInterval(() => {
            if (authWindow?.closed) {
                clearInterval(loginListener);
                return;
            }
            const receiveMessage = (event: any) => {
                // Check if the message came from the popup window
                if (event.origin !== window.location.origin) return;
                // Check if the message contains the data we need
                if (event.data.tw_cookies === "set") {
                    // Close the popup window
                    authWindow?.close();
                    setLoading(false);
                    setTwitchAuth(true);
                }
            };

            window.addEventListener("message", receiveMessage, false);
        }, 1000);
    };

    const handleTwitchDeauth = async () => {
        setLoading(true);

        const loadUrl = await fetch(`${BACKEND_URL}/api/twitchDeauth`, { method: "POST" });

        if (loadUrl.status === 200) setTwitchAuth(false);
        setLoading(false);
    };

    useEffect(() => {
        const { access_token, refresh_token } = getCookies();
        if (access_token && refresh_token) {
            setTwitchAuth(true);
            const validateCookies = async () => {
                const res = await fetch("https://id.twitch.tv/oauth2/validate", { headers: { authorization: "OAuth " + access_token } });
                const data = await res.json();
                if (res.status === 200) {
                    const timeToRefresh = data.expires_in;
                    setTimeout(() => {}, timeToRefresh * 1000);
                } else {
                    handleTwitchDeauth();
                }
            };
            validateCookies();
            const cookieInterval = setInterval(validateCookies, 3600000);
            return () => clearInterval(cookieInterval);
        }
    }, []);

    return (
        <button
            onClick={twitchAuth ? handleTwitchDeauth : handleTwitchAuth}
            disabled={loading}
            className={`${twitchAuth ? "bg-slate-800 hover:bg-[#6441a5]" : "bg-[#6441a5] hover:bg-purple-800"} rounded-xl p-2 cursor-pointer`}>
            {twitchAuth ? "Disconnect " : "Connect "} <FontAwesomeIcon icon={faTwitch} />
        </button>
    );
};

export default TwitchConnect;
