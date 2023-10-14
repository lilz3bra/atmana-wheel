import { getServerSession } from "next-auth";
import { SignInButton } from "./Buttons";
import Link from "next/link";
import { authOptions } from "@/api/auth/[...nextauth]/route";

const Navbar = () => {
    const session = getServerSession(authOptions);

    return (
        <div className="h-20 w-full border-b-2 flex items-center justify-between p-2">
            <ul className="flex ">
                <Link className="p-2 cursor-pointer hover:bg-blue-700 rounded-xl" href="/">
                    Home
                </Link>
                {!!session && (
                    <>
                        <Link className="p-2 cursor-pointer hover:bg-blue-700 rounded-xl" href="/history">
                            History
                        </Link>
                        <Link className="p-2 cursor-pointer hover:bg-blue-700 rounded-xl" href="/create">
                            Create
                        </Link>
                        <Link className="p-2 cursor-pointer hover:bg-blue-700 rounded-xl" href="/active">
                            Active
                        </Link>
                    </>
                )}
            </ul>
            <div className="flex flex-row gap-4">
                <SignInButton />
            </div>
        </div>
    );
};

export default Navbar;
