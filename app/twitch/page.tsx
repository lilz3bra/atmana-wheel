"use client";
import React, { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export default function TwitchAuth({ params }: { params: { code: string } }) {
    const firstRun = useRef(true);
    const searchParams = useSearchParams();

    const code = searchParams.get("code");
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const REDIRECT_URL = process.env.NEXT_PUBLIC_REDIRECT_URL;
    useEffect(() => {
        if (firstRun.current) {
            firstRun.current = false;
            const fetchTokens = async () => {
                try {
                    const response = await fetch(`${BACKEND_URL}/api/twitch`, {
                        method: "POST",
                        body: JSON.stringify({
                            code: code,
                            redirect_uri: REDIRECT_URL,
                        }),
                    });
                    // Store the access token and refresh token in local storage
                    const data = response.status;
                    if (data === 200) {
                        window.opener.postMessage({ tw_cookies: "set" }, "*");
                    } else {
                        return <div>There was an error logging into twitch. Please wait a few minutes and try again.</div>;
                    }
                } catch (error) {
                    console.error("Error fetching Twitch access token:", error);
                }
            };
            fetchTokens();
        }
    }, []);

    return <div>Logging in...</div>;
}