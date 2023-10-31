"use client";
import React from "react";

const TestHooks = () => {
    const createSub = () => {
        console.log("I will create an event sub. It will listen on the server");
    };
    return (
        <div>
            <div></div>
            <button onClick={createSub}>Click me</button>
        </div>
    );
};

export default TestHooks;
