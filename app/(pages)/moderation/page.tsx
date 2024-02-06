import { authOptions } from "@/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

const page = async () => {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("api/auth/signin");
    }

    const moderatorIn = await prisma.moderator.findMany({ where: { moderatorId: session.user.id }, select: { creator: { select: { name: true, id: true } } } });
    console.log(moderatorIn);
    return (
        <div className="flex flex-col justify-center align-middle m-auto w-fit">
            <Link className="block p-2 cursor-pointer bg-slate-600 hover:bg-blue-700 rounded-xl text-center m-2" href="/active">
                Moderate your channel
            </Link>
            <div>
                Channels you are allowed to moderate
                {moderatorIn.map((mod) => {
                    return (
                        <Link
                            key={mod.creator.id}
                            href={`/moderation/moderate/${mod.creator.id}`}
                            className="block p-2 cursor-pointer bg-slate-600 hover:bg-blue-700 rounded-xl text-center m-2">
                            {mod.creator.name}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default page;
