import ViewersList from "./ViewerList";

interface Props {
    params: {
        creatorId: string;
    };
}
export default async function page({ params }: Props) {
    const creatorId = params.creatorId;

    return (
        <>
            <ViewersList creatorId={creatorId} />
        </>
    );
}
