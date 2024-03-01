import WinnerList from "./WinnerList";

interface Props {
    params: {
        creatorId: string;
    };
}

export default async function page({ params }: Props) {
    const creatorId = params.creatorId;

    return (
        <>
            <WinnerList creatorId={creatorId} />
        </>
    );
}
