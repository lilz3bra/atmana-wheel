import React, { useState, useEffect } from "react";

export const Countdown = ({ endTime, callback }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime));

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft(endTime));
        }, 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    useEffect(() => {
        if (!timeLeft) {
            callback(true);
        }
    });

    if (!timeLeft) {
        return <div>The raffle has ended</div>;
    }

    const { days, hours, minutes, seconds } = timeLeft;
    let timeString = "";
    if (days > 0) {
        timeString += `${days}d `;
    }
    if (days > 0 || hours > 0) {
        timeString += `${hours.toString().padStart(2, "0")}h `;
    }
    if (days > 0 || hours > 0 || minutes > 0) {
        timeString += `${minutes.toString().padStart(2, "0")}m `;
    }
    timeString += `${seconds.toString().padStart(2, "0")}s `;
    return <>{timeString}</>;
};

const calculateTimeLeft = (endTime) => {
    const difference = new Date(endTime) - new Date();
    if (difference < 0) {
        return null;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return { days, hours, minutes, seconds };
};
