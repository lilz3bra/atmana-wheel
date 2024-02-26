import Link from "next/link";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function ModNavBar({ slug }: { slug: string }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/api/auth/signin");
    }

    // Make sure user has moderation rights in this channel
    const moderatorIn = await prisma.moderator.findFirst({
        where: { moderatorId: session.user.id, creatorId: slug },
        select: { creator: { select: { name: true, id: true } } },
    });
    if (!moderatorIn) return <div>Forbidden</div>;

    return (
        <>
            <div className="border flex flex-row justify-center m-2 p-2 rounded-lg">
                <Link className="block p-2 cursor-pointer bg-slate-600 hover:bg-blue-700 rounded-xl text-center m-2" href={`/moderation/moderate/${slug}/banned/1`}>
                    Banned
                </Link>
                <Link className="block p-2 cursor-pointer bg-slate-600 hover:bg-blue-700 rounded-xl text-center m-2" href={`/moderation/moderate/${slug}/viewers/1`}>
                    Viewers
                </Link>
                <Link className="block p-2 cursor-pointer bg-slate-600 hover:bg-blue-700 rounded-xl text-center m-2" href={`/moderation/moderate/${slug}/winners/1`}>
                    Winners
                </Link>
                <Link className="block p-2 cursor-pointer bg-slate-600 hover:bg-blue-700 rounded-xl text-center m-2" href={`/moderation/moderate/${slug}/active/1`}>
                    Active
                </Link>
            </div>
        </>
    );
}
