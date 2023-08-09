import ReactModal from "react-modal";
import { useState } from "react";
import { useEffect, useLayoutEffect } from "react";
import { Wheel } from "./Wheel";
import { useRef } from "react";

function Modal({ entries, onClose }: { entries: Entry[]; onClose: Function }) {
    const [isOpen, setIsOpen] = useState(true);
    const [isClosing, setIsClosing] = useState(false);

    const firstRun = useRef(true);
    const [ent, setEnt] = useState();
    const root = document.getElementById("main-content")!;
    const parentRef = useRef();
    const [parentSize, setParentSize] = useState({ width: 500, height: 300 });

    const handleCloseModal = () => {
        setIsClosing(true);
        setIsOpen(false);
        onClose();
    };

    const updateDb = (winner: Array<Object>) => {
        console.log(`winner: ${winner}`);
    };

    return (
        <ReactModal
            isOpen={isOpen}
            id="modal"
            contentLabel="Register dialog"
            className="absolute block top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-full w-2/3 h-5/6 rounded-xl bg-white"
            overlayClassName="fixed top-0 right-0 bottom-0 left-0 bg-black/50"
            appElement={root}
            onRequestClose={handleCloseModal}>
            <button
                className="flex absolute justify-center items-center top-1 right-1 rounded-full w-6 h-6 bg-orange-900 text-center text-gray-950 font-bold hover:bg-red-400 hover:text-gray-700"
                onClick={handleCloseModal}>
                X
            </button>
            {entries ? <Wheel entries={entries} callback={updateDb} closing={isClosing} /> : null}
        </ReactModal>
    );
}
export default Modal;
