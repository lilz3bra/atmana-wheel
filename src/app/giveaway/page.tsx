import React, { useEffect, useState } from "react";
import { UserAuth } from "../context/AuthContext";

const Giveaway = () => {
    const { user } = UserAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthentication = async () => {
            await new Promise((resolve) => setTimeout(resolve, 250));
            setLoading(false);
        };
        checkAuthentication();
    }, [user]);
    if (!user) {
        return <div>You need to log in to see this page</div>;
    } else {
        return <div>Giveaway</div>;
    }
};

export default Giveaway;
