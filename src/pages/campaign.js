import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useCampaign from "../hooks/useCampaign";
import { formatEther, parseEther } from "ethers";
import { formatDate, shortenAccount } from "../utils";
import useContribute from "../hooks/useContribute";
import { useConnection } from "../context/connection";
import { toast } from "react-toastify";

const Campaign = () => {
    const [amountInput, setAmountInput] = useState(0);
    let { id } = useParams();
    const navigate = useNavigate();
    const contribute = useContribute();
    const [sendingTx, setSendingTx] = useState(false);
    const { isActive, provider } = useConnection();
    const { campaign, state } = useCampaign(id);
    if (state === "NOT_FOUND") return navigate("/");
    if (state === "LOADING") return <p>Loading...</p>;

    const handleContribute = async () => {
        if (!isActive || !provider) return;
        if (amountInput <= 0) return toast.info("Enter a non-zero amount!");

        try {
            setSendingTx(true);
            const tx = await contribute(id, parseEther(String(amountInput)));
            const receipt = await tx.wait();

            if (receipt.status === 0) return toast.error("tx failed");

            toast.success("Thanks for contibuting!!");
        } catch (error) {
            console.log("error: ", error);
            if (error.info.error.code === 4001) {
                return toast.error("You rejected the request");
            }
            toast.error("Campaign Has Expired");
        } finally {
            setSendingTx(false);
        }
    };
    return (
        <div className="flex flex-col items-center justify-center px-4 pt-16 mx-auto sm:max-w-xl md:max-w-full lg:pt-32 md:px-0">
            <div className="flex flex-col items-center max-w-2xl md:px-8">
                <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
                    <div className="mb-4">
                        <span
                            className={`${
                                campaign.isActive
                                    ? "bg-green-400 text-white"
                                    : "bg-red-400 text-white"
                            } w-fit text-sm px-4 py-2 rounded-full`}
                        >
                            {campaign.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                    <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 sm:text-4xl md:mx-auto">
                        <span className="relative inline-block">
                            <svg
                                viewBox="0 0 52 24"
                                fill="currentColor"
                                className="absolute top-0 left-0 z-0 hidden w-32 -mt-8 -ml-20 text-blue-gray-100 lg:w-32 lg:-ml-28 lg:-mt-10 sm:block"
                            >
                                <defs>
                                    <pattern
                                        id="192913ce-1f29-4abd-b545-0fbccfd2b0ec"
                                        x="0"
                                        y="0"
                                        width=".135"
                                        height=".30"
                                    >
                                        <circle cx="1" cy="1" r=".7" />
                                    </pattern>
                                </defs>
                                <rect
                                    fill="url(#192913ce-1f29-4abd-b545-0fbccfd2b0ec)"
                                    width="52"
                                    height="24"
                                />
                            </svg>
                            <span className="relative">The</span>
                        </span>{" "}
                        Campaign '{campaign.title}'
                    </h2>
                </div>
                <div className="flex flex-col items-center w-full mb-4 md:flex-row">
                    <input
                        value={amountInput}
                        onChange={(e) => setAmountInput(Number(e.target.value))}
                        placeholder="0.1"
                        required=""
                        type="number"
                        min={0}
                        step={0.01}
                        className="flex-grow w-full h-12 px-4 mb-3 transition duration-200 bg-white border border-gray-300 rounded shadow-sm appearance-none md:mr-2 md:mb-0 focus:border-blue-400 focus:outline-none focus:shadow-outline"
                    />
                    <button
                        onClick={handleContribute}
                        className="inline-flex items-center justify-center w-full h-12 px-6 font-medium tracking-wide text-white transition duration-200 rounded shadow-md md:w-auto bg-blue-400 hover:bg-blue-700 focus:shadow-outline focus:outline-none"
                    >
                        {sendingTx ? "Contributing..." : "Contribute"}
                    </button>
                </div>
                <div className="max-w-md mb-10 text-xs text-gray-600 sm:text-sm md:text-center">
                    <div>
                        <div className="px-6 py-4">
                            <p className="mt-2 font-bold text-gray-500">
                                Expire on - {formatDate(campaign?.durationTime)}
                            </p>
                            <p className="mt-2 font-bold text-gray-500">
                                Balance -{" "}
                                {formatEther(campaign?.fundingBalance)} ETH
                            </p>
                            <p className="mt-2 font-bold text-gray-500">
                                Funding Goal -{" "}
                                {formatEther(campaign?.fundingGoal)} ETH
                            </p>
                            {campaign?.contributors.length > 0 && (
                                <div className="font-bold text-gray-500 mt-3">
                                    <span className="font-bold">
                                        Contributors
                                    </span>
                                    {campaign?.contributors?.map(
                                        (contributor, index) => (
                                            <p key={index} className="mt-2">
                                                {shortenAccount(
                                                    String(contributor)
                                                )}
                                            </p>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Campaign;
