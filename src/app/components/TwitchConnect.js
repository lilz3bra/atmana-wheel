import React, { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const TwitchConnect = () => {
    const [response, setResponse] = useState(false);
    const [loading, setLoading] = useState(false);
    const { twitchAuth, secLevel } = useSelector((st) => st.atmanaSlice);
    const client_id = window.REACT_APP_TWITCH_API_KEY;
    const REDIRECT_URL = window.REDIRECT_URL;
    const BACKEND_URL = window.BACKEND_URL;

    const handleTwitchAuth = () => {
        setLoading(true);

        const redirect_uri = `${REDIRECT_URL}/twitchAuth`;
        const scope = parseInt(secLevel) === 2 ? "chat:read+channel:read:redemptions+chat:edit" : "chat:read+channel:read:redemptions";
        const twitchAuthUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}`;

        const authWindow = window.open(twitchAuthUrl, "_blank", "width=500,height=600");

        const pollAuthWindow = setInterval(() => {
            if (authWindow.closed) {
                clearInterval(pollAuthWindow);
                return;
            }
            const receiveMessage = (event) => {
                // Check if the message came from the popup window
                if (event.origin !== window.location.origin) return;
                // Check if the message contains the data we need
                if (event.data.access_token && event.data.refresh_token) {
                    // Close the popup window
                    authWindow.close();
                    setResponse(true);
                    setLoading(false);
                    getTwitchUser(event.data.access_token);
                }
            };

            window.addEventListener("message", receiveMessage, false);
        }, 1000);
    };

    const getTwitchUser = async (access_token) => {
        const res = await axios.post(`${BACKEND_URL}/user/updateTwitch`, { access_token }, { withCredentials: true });
        if (res.data[0]?.login) {
            window.localStorage.setItem("twitchUser", res.data[0].login);
        }
    };

    const handleTwitchDeauth = () => {};

    return (
        <div>
            <button onClick={response || twitchAuth ? handleTwitchDeauth : handleTwitchAuth} disabled={loading}>
                {response || twitchAuth ? "Disconnect from" : "Connect with"} Twitch
            </button>
        </div>
    );
};

export default TwitchConnect;
