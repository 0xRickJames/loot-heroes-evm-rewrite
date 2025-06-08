import {useAnchorWallet} from "@solana/wallet-adapter-react";
import MinHeader from "../Widget/MinHeader";
import Loot from "../Widget/Loot";

function MintHero() {
    const wallet = useAnchorWallet();

    return (
        <>
            <div className="text-center w-full flex border-solid bg-opacity-50 border-white shadow-lg border-4 p-4 mt-10">
                <div className="flex flex-col w-3/5 text-left">
                    <div>
                        <MinHeader className="text-4xl">Wallet Address</MinHeader>
                    </div>
                    <div>
                        { wallet ?
                            <>
                                {wallet.address.toBase58()}
                            </> :
                            <>
                                Please connect your wallet first
                            </>
                        }
                    </div>
                </div>
                <div className="flex flex-col space-y-2 text-right w-2/5">
                    <div>
                        Unclaimed $LOOT
                    </div>
                    <div>
                        { wallet ?
                            <Loot>0</Loot> :
                            <>
                                <Loot>0</Loot>
                            </>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

export default MintHero;
