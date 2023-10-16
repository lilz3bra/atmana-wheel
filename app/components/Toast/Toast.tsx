"use client";
import { faArrowRightFromBracket, faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import ToastProps from "./Toast";
import Link from "next/link";

const Toast = ({ stack }: ToastProps) => {
    if (!stack) return null;
    return (
        <div className="flex flex-col absolute right-4 bottom-4 gap-4">
            {stack.map((item, index) => {
                return (
                    <div key={index} className=" border rounded-lg p-2 flex flex-row items-center bg-slate-800">
                        <FontAwesomeIcon
                            icon={item.type === "error" ? faCircleXmark : faCircleCheck}
                            size="xl"
                            className={`${item.type === "error" ? "text-red-600" : "text-green-600"} pr-2`}
                        />
                        {item.text}
                        {!!item.link && (
                            <Link href={item.link} className="p-2 hover:bg-slate-500 rounded-lg">
                                <FontAwesomeIcon icon={faArrowRightFromBracket} size="sm" />
                            </Link>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default Toast;
