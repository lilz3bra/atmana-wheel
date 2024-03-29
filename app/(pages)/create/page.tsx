import CreateForm from "./CreateForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

const Create = async () => {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("api/auth/signin");
    }

    return <CreateForm />;
};

export default Create;
