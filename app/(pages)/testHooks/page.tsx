"use client";
import React, { useState } from "react";

const TestHooks = () => {
    const [result, setResult] = useState();
    const [enabled, setEnabled] = useState(false);

    const createSub = async () => {
        console.log("I will create an event sub. It will listen on the server");
        const res = await fetch("/api/testHooks", { method: "PUT" });
        const data = await res.json();
        setResult(data);
    };

    return (
        <div>
            <div>{JSON.stringify(result)}</div>
            <input type="text" name="redemption" id="redemption" />
            <button onClick={createSub}>Click me</button>
        </div>
    );
};

export default TestHooks;
