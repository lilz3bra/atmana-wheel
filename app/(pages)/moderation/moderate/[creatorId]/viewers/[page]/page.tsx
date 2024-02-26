import Link from "next/link";
import ViewerItem from "./ViewerItem";
import { prisma } from "@/lib/prisma";

interface Props {
    params: {
        page: string;
        creatorId: string;
    };
}
export default async function page({ params }: Props) {
    const page = Number(params.page);

    const creatorId = params.creatorId;
    const skip = (page - 1) * 20;

    const viewers = await prisma.streamViewers.findMany({
        where: { creatorId: creatorId },
        select: { viewer: { select: { name: true, id: true } }, isBanned: true },
        orderBy: { viewer: { name: "asc" } },
        skip: skip,
        take: 20,
    });

    return (
        <>
            <div className="flex flex-row align-middle justify-center items-center gap-2">
                <Link href={`${page - 1}`} className="bg-slate-700 rounded-xl p-1 hover:bg-slate-800 w-fit">
                    Prev
                </Link>
                Page {page}
                <Link href={`${page + 1}`} className="bg-slate-700 rounded-xl p-1 hover:bg-slate-800 w-fit">
                    Next
                </Link>
            </div>
            <div className="w-fit flex flex-col gap-1 m-auto ">
                {viewers.map((v, index) => {
                    return <ViewerItem key={v.viewer.id} creator={creatorId} viewer={v} index={index} />;
                })}
            </div>
        </>
    );
}
