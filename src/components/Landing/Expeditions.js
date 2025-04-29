import {useAnchorWallet} from "@solana/wallet-adapter-react";
import MinHeader from "../Widget/MinHeader";

import React, {useState} from "react";
import Loot from "../Widget/Loot";
import ModalGeneric from "../Widget/Modal";

function ExpeditionCard(props) {
    const wallet = useAnchorWallet();
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <div className="flex flex-col">
                <MinHeader className="text-4xl mt-4">{props.title}</MinHeader>
                <p className="mt-4 text-xl">
                    {props.children}
                </p>
            </div>
            <div className="border-4 mx-2 md:mx-8 p-14 text-2xl md:text-5xl text-red-700 font-bold uppercase">
                {wallet ?
                    <>
                        Select Heroes for Expeditions
                    </>
                    :
                    <>
                        Connect your wallet to see your heroes
                    </>
                }
            </div>
            <div className="px-2 md:px-14 flex flex-col md:flex-row space-x-4 space-y-4 md:space-y-0 place-items-center justify-center">
                <div className="border-4 text-2xl px-4 md:text-4xl uppercase md:px-12 md:py-4 ll-font-head">
                    Staked Heroes: 0
                </div>
                <div className="border-4 text-2xl px-4 md:text-4xl uppercase md:px-12 md:py-4 ll-font-head bg-white text-black cursor-pointer hover:bg-gray-300" onClick={(e) => setShowModal(true)}>
                    Stake Heroes
                </div>
            </div>
            <ModalGeneric showModal={showModal} setShowModal={setShowModal} />
        </>
    )
}

function Expeditions() {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <div className="text-center w-full flex flex-col p-4 mt-10 border-4 text-center space-y-4">
                <div>
                    <MinHeader className="text-6xl">Expeditions</MinHeader>
                </div>
                <div className="flex flex-col space-y-4">
                    <ExpeditionCard title="Stake Your Heroes">
                        Lords & Knights earn <Loot>100</Loot> daily while soldiers earn <Loot>150</Loot> daily on expeditions
                    </ExpeditionCard>
                    <div className="2xl:mx-80 border-t-4 flex flex-col md:flex-row justify-center font-bold ll-font-head text-2xl md:text-4xl pt-8 md:space-x-8 md:space-y-0 space-y-4 align-middle">
                        <p className="text-yellow-500 font-bold">Unclaimed rewards: 0</p>
                        <div className="bg-white pt-2 pb-2 cursor-pointer hover:bg-gray-300 md:px-32" onClick={(e) => setShowModal(true)}>
                            <MinHeader className="text-gray-800 hover:text-gray-900 uppercase">Claim</MinHeader>
                        </div>
                    </div>
                </div>
            </div>
            <ModalGeneric showModal={showModal} setShowModal={setShowModal} />
        </>
    )
}

export default Expeditions;
