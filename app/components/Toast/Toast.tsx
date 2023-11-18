"use client";
import { faArrowRightFromBracket, faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import ToastProps from "./Toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Toast = ({ stack }: ToastProps) => {
    const [hide, setHide] = useState<boolean[]>(new Array(stack.length).fill(false));
    const router = useRouter();

    if (!stack) return null;

    const handleClick = (index: number) => {
        const hidden = [...hide];
        hidden[index] = true;
        setHide(hidden);
    };

    return (
        <div className="flex flex-col absolute right-4 bottom-4 gap-4">
            {stack.map((item, index) => {
                return (
                    !hide[index] &&
                    (item.type === "error" ? (
                        <div
                            key={index}
                            onClick={(e) => handleClick(index)}
                            className={`flex flex-row border cursor-pointer rounded-lg p-2 ${
                                item.type === "error" ? "hover:bg-red-600" : "hover:bg-green-600"
                            } items-center bg-slate-800 animate-bounce duration-700 `}>
                            <FontAwesomeIcon
                                icon={item.type === "error" ? faCircleXmark : faCircleCheck}
                                size="xl"
                                className={`${item.type === "error" ? "text-red-800" : "text-green-800"} pr-2`}
                            />
                            {item.text}
                            {!!item.link && (
                                <Link href={item.link} className="p-2 hover:bg-slate-500 rounded-lg">
                                    <FontAwesomeIcon icon={faArrowRightFromBracket} size="sm" />
                                </Link>
                            )}
                        </div>
                    ) : (
                        <Link
                            key={index}
                            href={item.link!}
                            className={`flex flex-row hover:bg-green-600 border cursor-pointer rounded-lg p-2 "
                            items-center bg-slate-800 animate-bounce duration-700 `}>
                            <FontAwesomeIcon icon={faCircleCheck} size="xl" className="text-green-800 pr-2" />
                            {item.text}
                            <FontAwesomeIcon icon={faArrowRightFromBracket} size="sm" />
                        </Link>
                    ))
                );
            })}
        </div>
    );
};

export default Toast;
