"use client";
import React, { useEffect, useState } from "react";
interface Props {
    className?: string;
    placeholder?: string;
    timeout: number;
    onChange: Function;
}
const DebouncedTextBox = ({ className, placeholder, timeout, onChange }: Props) => {
    const [text, setText] = useState("");

    useEffect(() => {
        const delayedDebounceChange = setTimeout(() => {
            onChange(text);
        }, timeout);
        return () => clearTimeout(delayedDebounceChange);
    }, [text]);

    return <input className={className} type="text" name="name" id="name" placeholder={placeholder} value={text} onChange={(e) => setText(e.target.value)} />;
};

export default DebouncedTextBox;
