"use client";
import React, { useEffect, useRef } from "react";

export default function TwitchAuth({ searchParams }: any) {
    const firstRun = useRef(true);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const REDIRECT_URL = process.env.NEXT_PUBLIC_REDIRECT_URL;
    useEffect(() => {
        if (firstRun.current) {
            firstRun.current = false;
            const fetchTokens = async () => {
                const code: string = searchParams.code;
                try {
                    const response = await fetch(`${BACKEND_URL}/api/twitch`, {
                        method: "POST",
                        body: JSON.stringify({
                            code: code,
                            redirect_uri: REDIRECT_URL,
                        }),
                    });
                    // Store the access token and refresh token in local storage
                    const data = await response.json();
                    localStorage.setItem("access_token", data.access_token);
                    localStorage.setItem("refresh_token", data.refresh_token);
                    window.opener.postMessage({ access_token: data.access_token, refresh_token: data.refresh_token }, "*");
                } catch (error) {
                    console.error("Error fetching Twitch access token:", error);
                }
            };
            fetchTokens();
        }
    }, []);

    return <div>Logging in...</div>;
}
