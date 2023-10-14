"use client";
import React from "react";
interface Props {
    users: UsersList;
    tot: number;
}
const ParticipantsList = ({ users, tot }: Props) => {
    const userElements: JSX.Element[] = [];

    Object.keys(users!).forEach((name) => {
        const weight = users![name];

        const percentage = ((weight / tot) * 100).toFixed(2);
        userElements.push(
            <p key={name}>
                <span className="font-bold">{name}</span>: {weight} entr{weight > 1 ? "ies" : "y"} <span className="italic">({percentage}%)</span>
            </p>
        );
    });
    return <>{userElements}</>;
};

export default ParticipantsList;
