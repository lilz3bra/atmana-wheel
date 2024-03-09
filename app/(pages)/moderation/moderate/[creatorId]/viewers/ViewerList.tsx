"use client";
import React, { useCallback, useEffect, useState } from "react";
import { getViewers } from "./getViewers";
import ViewerItem from "./ViewerItem";
import TripleStateButton from "@/components/TripleStateButton";
import DebouncedTextBox from "@/components/DebouncedTextBox";

interface Viewer {
    id: string;
    isBanned: boolean;
    viewer: {
        id: string;
        name: string;
    };
}

const ViewersList = ({ creatorId }: { creatorId: string }) => {
    const [page, setPage] = useState(1);
    const [bannedFilter, setBannedFilter] = useState<boolean | null>(null);
    const [viewers, setViewers] = useState<Viewer[]>([]);
    const [username, setUsername] = useState<string>("");

    const skip = (page - 1) * 20;

    const fetchViewers = useCallback(async () => {
        return await getViewers(creatorId, skip, bannedFilter, username);
    }, [page, bannedFilter, username]);

    useEffect(() => {
        const call = async () => {
            const v = await fetchViewers();
            setViewers(v);
        };
        call();
    }, [fetchViewers, page, bannedFilter]);

    const handleFilterChange = useCallback((status: boolean | null) => {
        // Since we need to change state on the callback, we need to keep it memoized or it will keep changing references
        setBannedFilter(status);
    }, []);

    return (
        <>
            <div className="flex flex-row align-middle justify-center items-center gap-2">
                <button onClick={() => setPage(page - 1)} className="bg-slate-700 rounded-xl p-1 hover:bg-slate-800 w-fit">
                    Prev
                </button>
                Page {page}
                <button onClick={() => setPage(page + 1)} className="bg-slate-700 rounded-xl p-1 hover:bg-slate-800 w-fit">
                    Next
                </button>
                <TripleStateButton
                    callbackFn={(status: boolean | null) => {
                        handleFilterChange(status);
                    }}
                    trueText="Only banned"
                    nullText="All"
                    falseText="Only not banned"
                />
                <DebouncedTextBox
                    className="text-black rounded-md p-1"
                    placeholder="Search user"
                    timeout={300}
                    onChange={(e: string) => {
                        setUsername(e);
                    }}
                />
            </div>
            <div className="w-fit flex flex-col gap-1 m-auto mb-4 p-2">
                {viewers.map((v, index) => {
                    return <ViewerItem key={v.viewer.id} creator={creatorId} viewer={v} index={index} />;
                })}
            </div>
        </>
    );
};

export default ViewersList;
