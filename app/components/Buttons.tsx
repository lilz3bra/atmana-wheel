"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export function SignInButton() {
    const { data: session, status } = useSession();
    if (status === "loading") {
        return <>...</>;
    }
    if (status === "authenticated") {
        return (
            <>
                <div className="rounded-full overflow-hidden w-[40px] h-[40px] ">
                    <Link href={`/profile/${session.user.id}`}>
                        <Image src={session.user?.image} width={40} height={40} alt="You" />
                    </Link>
                </div>
                <SignOutButton />
            </>
        );
    }
    return <button onClick={() => signIn()}>Sign In</button>;
}

export function SignOutButton() {
    return <button onClick={() => signOut()}>Sign out</button>;
}
