import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import ActiveItem from "./ActiveItem";

interface item {
    id: string;
    title: string;
    cost: number;
}
const History = async () => {
    // Validate authorization
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("api/auth/signin");
    }

    // Get data stored in the jwt sent
    const thisUser = session.user;

    const head = { Authorization: "Bearer " + thisUser.access_token, "client-id": process.env.NEXT_PUBLIC_TWITCH_API_KEY };

    if (thisUser) {
        const fetchedItems = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${thisUser.providerAccountId}&only_manageable_rewards=true`, {
            method: "GET",
            headers: head,
        });
        const res = await fetchedItems.json();
        return (
            <div>
                {res.data && (
                    <div className="m-4 flex flex-row ">
                        {res.data.map((i: item) => {
                            return <ActiveItem item={i} key={i.id} />;
                        })}
                    </div>
                )}
            </div>
        );
    }
};

export default History;
