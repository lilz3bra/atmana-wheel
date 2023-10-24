import React, { ReactNode } from "react";
interface Props {
    children: ReactNode;
    text: string;
    extraCss?: string;
}

const Hint = ({ children, text, extraCss }: Props) => {
    return (
        <div className={`w-full group ${typeof extraCss !== "undefined" ? extraCss : ""}`}>
            {children}
            <div className="bg-black bg-opacity-80 hidden group-hover:block group-hover:absolute  translate-y-10 rounded-lg p-2 m-auto">{text}</div>
        </div>
    );
};

export default Hint;
