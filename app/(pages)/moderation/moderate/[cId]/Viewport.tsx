import React from "react";
import ViewersList from "./ViewerList";

const Viewport = ({ action, creator }: { action: string; creator: string }) => {
    if (action === "viewers") return <ViewersList key={action} creator={creator} />;
    if (action === "banned") return <ViewersList key={action} creator={creator} filter="banned" />;
    return <div>{action}</div>;
};

export default Viewport;
