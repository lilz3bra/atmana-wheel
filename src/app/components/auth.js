import { useState, useEffect, useRef } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSecLevel, setTwitchAuth, setTwitchUser } from "../store/AtmanaSlice";
import axios from "axios";

const BACKEND_URL = window.BACKEND_URL;

export const useMetamask = () => {
    const [connected, setConnected] = useState(false);
    const [accounts, setAccounts] = useState();

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum
                .request({ method: "eth_accounts" })
                .then((accounts) => {
                    if (accounts.length > 0) {
                        setAccounts(accounts);
                        setConnected(true);
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, []);

    const requestAuth = async () => {
        try {
            const wallet = await window.ethereum.request({ method: "eth_requestAccounts" });
            setConnected(true);
            setAccounts(wallet);
            window.localStorage.setItem("wallet", wallet);
            return wallet;
        } catch (error) {
            console.error(error);
        }
    };

    return { connected, accounts, requestAuth };
};

export const useLogout = () => {
    // Log out (clear saved data)
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [, , removeCookie] = useCookies();

    const logout = () => {
        const clear = async () => {
            await axios.get(`${BACKEND_URL}/user/logout`);
        };
        clear(); // FIXME: checkif cookies work on server
        dispatch(setSecLevel(0));
        window.localStorage.removeItem("userID");
        window.localStorage.removeItem("secLevel");
        window.localStorage.removeItem("twitchUser");
        window.localStorage.removeItem("access_token");
        window.localStorage.removeItem("refresh_token");
        window.localStorage.removeItem("exp");

        navigate("/");
    };
    return { logout };
};

export const useReqSign = (accounts) => {
    // Request user's signature
    const dispatch = useDispatch();
    const reqSign = async () => {
        const bufferModule = require("buffer");
        const Buffer = bufferModule.Buffer;
        try {
            if (!accounts[0]) {
                alert(`An error occured, please send us a screenshot of this message. ${accounts}`);
            }
            const response = await axios.get(`${BACKEND_URL}/user/challenge/wallet=${accounts[0]}`);
            const challenge = response.data.challenge;
            const from = accounts[0];
            const msg = `0x${Buffer.from(challenge, "utf8").toString("hex")}`;
            const sign = await window.ethereum.request({
                method: "personal_sign",
                params: [msg, from],
            });

            const res = await axios.post(`${BACKEND_URL}/user/login/`, { wallet: accounts[0], signature: sign, hash: challenge }, { withCredentials: true });
            if (res.data.token) {
                console.log(res.data.token);
            }
            if (res.data.message) {
                alert(res.data.message);
            }
            if (res.data.userID) {
                window.localStorage.setItem("userID", res.data.userID);
                window.localStorage.setItem("exp", Date.now());
                window.localStorage.setItem("secLevel", res.data.secLevel);
                dispatch(setSecLevel(res.data.secLevel));
            }
        } catch (err) {
            console.error(err);
        }
    };
    return { reqSign };
};

export const useCheckLogin = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const handleStorageChange = () => {
            const twitchUser = localStorage.getItem("twitchUser");
            const updatedValue = localStorage.getItem("secLevel");
            const twitchValue = localStorage.getItem("access_token");

            if (updatedValue != null) {
                dispatch(setSecLevel(updatedValue));
            } else {
                dispatch(setSecLevel(0));
            }
            if (twitchValue != null) {
                dispatch(setTwitchAuth(true));
            } else {
                dispatch(setTwitchAuth(false));
            }
            if (twitchUser != null) {
                dispatch(setTwitchUser(twitchUser));
            } else {
                dispatch(setTwitchUser(null));
            }
        };
        // Set initial secLevel from localStorage
        handleStorageChange();
        // Listen for changes to localStorage and update store

        window.addEventListener("storage", handleStorageChange);

        // Clean up event listener on unmount
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [dispatch]);
};

export const useRefreshCookies = () => {
    const { logout } = useLogout();
    const user = localStorage.getItem("userID");
    const isInitialLoad = useRef(true);

    useEffect(() => {
        const twitchToken = localStorage.getItem("access_token");
        const twitchRefresh = localStorage.getItem("refresh_token");

        const refreshCookies = async () => {
            try {
                const res = await axios.post(`${BACKEND_URL}/user/refreshToken`, { twitchToken, twitchRefresh }, { withCredentials: true });
                if (!res.data?.userID) {
                    logout();
                } else {
                    window.localStorage.setItem("exp", Date.now());
                    if (res.data.error) {
                        window.localStorage.removeItem("twitchUser");
                        window.localStorage.removeItem("access_token");
                        window.localStorage.removeItem("refresh_token");
                    }
                    if (res.data?.tokens) {
                        localStorage.setItem("access_token", res.data.tokens.access_token);
                        localStorage.setItem("refresh_token", res.data.tokens.refresh_token);
                    }
                }
            } catch (error) {
                logout();
                console.log(error);
            }
        };
        // Run only if we are logged in
        if (user) {
            // Skip if we just logged in
            if (isInitialLoad.current) {
                isInitialLoad.current = false;
                if (localStorage.getItem("exp") <= Date.now() - 5000) {
                    // Refresh cookies on page load
                    refreshCookies();
                }
            }

            // Set the interval
            const intervalId = setInterval(refreshCookies, 3599700);
            return () => {
                // Cleanup the interval when the component unmounts
                clearInterval(intervalId);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, isInitialLoad]);
};
