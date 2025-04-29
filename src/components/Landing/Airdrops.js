import MinHeader from "../Widget/MinHeader";

import React, {useState} from "react";
import ModalGeneric from "../Widget/Modal";

function AirdropDay(props) {
    return (
        <span className={`border-4 text-4xl font-bold w-1/2 mx-auto py-8 md:py-4 inline-block align-middle ${props.className}`}>
            {props.children}
        </span>
    )
}


function Airdrops() {
    const [showModal, setShowModal] = useState(false);


    return (
        <>
            <div className="text-center w-full flex flex-col p-4 mt-10 border-4 text-center space-y-4">
                <div>
                    <MinHeader className="text-6xl">Airdrops</MinHeader>
                </div>
                <div className="text-2xl">
                    Holders of heroes are eligible for regular airdrops of gear, more heroes means more rewards
                </div>
                <div className="flex flex-col md:flex-row justify-center md:space-x-2 space-y-2 md:space-y-0 p-8">
                    <AirdropDay>1</AirdropDay>
                    <AirdropDay>2</AirdropDay>
                    <AirdropDay>3</AirdropDay>
                    <AirdropDay>4</AirdropDay>
                    <AirdropDay>5</AirdropDay>
                    <AirdropDay>6</AirdropDay>
                    <AirdropDay>7</AirdropDay>
                    <AirdropDay>8</AirdropDay>
                    <AirdropDay>9</AirdropDay>
                    <AirdropDay>10</AirdropDay>
                </div>
                <div className="text-2xl">
                    Last Airdrop was... <strong>starting after the mint!</strong>
                </div>
                <div>
                    <div className="bg-white pt-2 pb-2 cursor-pointer hover:bg-gray-300 px-8 md:px-32 inline-block text-4xl" onClick={(e) => setShowModal(true)}>
                        <MinHeader className="text-gray-800 hover:text-gray-900 uppercase">Claim Airdrop</MinHeader>
                    </div>
                </div>
            </div>

            <ModalGeneric showModal={showModal} setShowModal={setShowModal} />
        </>
    )
}

export default Airdrops;
