import ReactModal from "react-modal";
import { useState } from "react";
// import style from "../styles/drawModal.module.css";
import { useEffect, useLayoutEffect } from "react";
import { Wheel } from "./Wheel";
import { useRef } from "react";

interface Entry {
    name: string;
    weight: number;
}

function Modal({ entries, onClose }: { entries: Entry[]; onClose: Function }) {
    // const BACKEND_URL = window.BACKEND_URL;

    const [isOpen, setIsOpen] = useState(true);
    const [isClosing, setIsClosing] = useState(false);

    const firstRun = useRef(true);
    const [ent, setEnt] = useState();
    const root = document.getElementById("main_root") || undefined;
    const parentRef = useRef();
    const [parentSize, setParentSize] = useState({ width: 500, height: 300 });
    // const parentWidth = parentRef.current ? parentRef.current.offsetWidth : 500;
    // const parentHeight = parentRef.current ? parentRef.current.offsetHeight : 300;

    const handleCloseModal = () => {
        setIsClosing(true);
        setIsOpen(false);
        onClose();
    };

    const updateDb = (winner: Array<Object>) => {
        console.log(`winner: ${winner}`);
    };

    // useLayoutEffect(() => {
    //     const parentElement = parentRef.current;
    //     if (parentElement) {
    //         const { offsetWidth: width, offsetHeight: height } = parentElement;
    //         setParentSize({ width, height });
    //     }
    // }, []);
    return (
        <ReactModal
            isOpen={isOpen}
            id="modal"
            contentLabel="Register dialog"
            className="absolute block top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-full w-1/2 h-5/6 rounded-xl bg-white"
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
