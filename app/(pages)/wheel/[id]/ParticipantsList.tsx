"use client";
import React from "react";
interface Props {
    users: UsersList;
}
const ParticipantsList = ({ users }: Props) => {
    const userElements: JSX.Element[] = [];
    let tot = 0;
    Object.keys(users!).forEach((name) => {
        const weight = users![name];
        tot += weight;
    });
    Object.keys(users!).forEach((name) => {
        const weight = users![name];
        const perc = (weight / tot) * 100;
        const wholePart = Math.trunc(perc);
        const decimalPart = (Math.trunc(perc * 100) - wholePart * 100) / 100;
        const percentage = wholePart + decimalPart;
        userElements.push(
            <p key={name}>
                <span className="font-bold">{name}</span>: {weight} entr{weight > 1 ? "ies" : "y"} <span className="italic">({percentage}%)</span>
            </p>
        );
    });
    return <>{userElements}</>;
};

export default ParticipantsList;
