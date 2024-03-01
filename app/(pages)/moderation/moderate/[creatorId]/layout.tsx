import ModNavBar from "./navbar";

export default function ModerationLayout({ children, params }: { children: React.ReactNode; params: { creatorId: string; page?: string } }) {
    return (
        <>
            <ModNavBar slug={params.creatorId} />
            <div>{children}</div>
        </>
    );
}
