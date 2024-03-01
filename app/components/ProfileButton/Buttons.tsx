import ProfileButton from "./ProfileButton";
import SignInButton from "./SignInButton";
import { Session } from "next-auth";

export async function Buttons({ session }: { session: Session | null }) {
    if (!session) return <SignInButton />;

    return <ProfileButton img={session.user?.image} />;
}
