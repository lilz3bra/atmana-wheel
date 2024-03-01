import EditForm from "./EditForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface Props {
    params: {
        id: string;
    };
}
const Create = async ({ params }: Props) => {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("api/auth/signin");
    }
    const currentUser = session?.user?.id;
    const giveaway = await prisma.giveaways.findFirst({ where: { id: params.id } });
    if (giveaway) {
        return <EditForm giveaway={giveaway} />;
    } else {
        return <p>Invalid giveaway requested</p>;
    }
};

export default Create;
