"use client";
import React from "react";
interface Props {
    users: User[];
    tot: number;
}
const ParticipantsList = ({ users, tot }: Props) => {
    const userElements: JSX.Element[] = [];
    Object.keys(users!).forEach((_, index) => {
        const weight = users![index].ammount;
        const percentage = ((weight / tot) * 100).toFixed(2);
        userElements.push(
            <p key={users![index].name}>
                <span className="font-bold">{users![index].name}</span>: {weight} entr{weight > 1 ? "ies" : "y"}{" "}
                <span className="italic">({percentage}%)</span>
            </p>
        );
    });
    return <>{userElements}</>;
};

export default ParticipantsList;
