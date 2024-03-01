import { getServerSession } from "next-auth";
import { Buttons } from "./ProfileButton/Buttons";
import Link from "next/link";
import { authOptions } from "@/lib/authOptions";

const Navbar = async () => {
    const session = await getServerSession(authOptions);

    return (
        <div className="h-20 w-full border-b-2 flex items-center justify-between p-2">
            <ul className="flex flex-row gap-4">
                <Link className="p-2 cursor-pointer hover:bg-blue-700 rounded-xl" href="/">
                    Home
                </Link>
                {!!session && (
                    <div className="relative flex flex-row">
                        <Link className="block p-2 cursor-pointer hover:bg-blue-700 rounded-xl" href="/create">
                            Create
                        </Link>
                        <Link className="block p-2 cursor-pointer hover:bg-blue-700 rounded-xl" href="/history/wheel">
                            History
                        </Link>
                    </div>
                )}
            </ul>
            <div className="flex flex-row gap-4">
                <Buttons session={session} />
            </div>
        </div>
    );
};

export default Navbar;
