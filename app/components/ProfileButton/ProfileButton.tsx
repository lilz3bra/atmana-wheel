import Image from "next/image";
import Link from "next/link";
import LogOutButton from "./LogOutButton";

const ProfileButton = ({ img }: { img: string }) => {
    return (
        <div className="mx-auto flex w-full items-center justify-center">
            <div className="group relative cursor-pointer p-2">
                <div className="flex items-center justify-between rounded-full overflow-hidden w-[40px] h-[40px] p-1 box-content group-hover:bg-blue-800">
                    <Image src={img} width={40} height={40} className="rounded-full" alt="You" />
                </div>
                <div className="invisible absolute z-50 flex w-fit flex-col bg-slate-500 py-1 my-2 px-4 right-0 text-gray-800 shadow-xl group-hover:visible rounded-md">
                    <Link className={`text-white hover:bg-slate-600 py-1 px-2 rounded-lg`} href="/moderation">
                        Moderation
                    </Link>
                    <LogOutButton />
                </div>
            </div>
        </div>
    );
};

export default ProfileButton;
