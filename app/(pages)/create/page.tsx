import CreateForm from "./CreateForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

const Create = () => {
    const session = getServerSession(authOptions);
    if (!session) {
        redirect("api/auth/signin");
    }

    return <CreateForm />;
};

export default Create;
