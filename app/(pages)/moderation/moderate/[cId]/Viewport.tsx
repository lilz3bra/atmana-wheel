import React from "react";
import ViewersList from "./ViewerList";

const Viewport = ({ action, creator }: { action: string; creator: string }) => {
    if (action === "viewers") return <ViewersList creator={creator} />;
    return <div>{action}</div>;
};

export default Viewport;
