import { getServerSession } from "next-auth";
import { SignInButton } from "./Buttons";
import Link from "next/link";
import { authOptions } from "@/api/auth/[...nextauth]/route";

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
                        <div className="group/wheel relative">
                            <p className="p-2 cursor-pointer rounded-xl">Wheel</p>
                            <div className="hidden group-hover/wheel:flex absolute top-full left-0 bg-black border rounded-md p-2">
                                <Link className="block p-2 cursor-pointer hover:bg-blue-700 rounded-xl" href="/wheel/history">
                                    History
                                </Link>
                                <Link className="block p-2 cursor-pointer hover:bg-blue-700 rounded-xl" href="/wheel/create">
                                    Create
                                </Link>
                            </div>
                        </div>
                        <div className="group/prompt relative">
                            <p className="p-2 cursor-pointer rounded-xl">Prompts</p>
                            <div className="hidden group-hover/prompt:flex absolute top-full left-0 bg-black border rounded-md p-2">
                                <Link className="block p-2 cursor-pointer hover:bg-blue-700 rounded-xl" href="/prompts/history">
                                    History
                                </Link>
                                <Link className="block p-2 cursor-pointer hover:bg-blue-700 rounded-xl" href="/prompts/create">
                                    Create
                                </Link>
                            </div>
                        </div>
                        <Link className="block p-2 cursor-pointer hover:bg-blue-700 rounded-xl" href="/active">
                            Active
                        </Link>
                    </div>
                )}
            </ul>
            <div className="flex flex-row gap-4">
                <SignInButton />
            </div>
        </div>
    );
};

export default Navbar;
