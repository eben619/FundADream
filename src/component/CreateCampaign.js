import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";
import useProposeCampaign from "../hooks/useProposeCampaign";
import { useConnection } from "../context/connection";
import { supportedChains } from "../constants";
import { parseEther } from "ethers";
import { toast } from "react-toastify";

const CreateCampaign = () => {
    let [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [goal, setGoal] = useState(0.5);
    const [duration, setDuration] = useState(1);
    const [sendingTx, setSendingTx] = useState(false);
    const { connect, isActive, account, switchToChain } = useConnection();

    const proposeCampaign = useProposeCampaign();

    function closeModal() {
        if (sendingTx) return;
        setIsOpen(false);
    }

    function openModal() {
        setIsOpen(true);
    }

    const handleProposeCampaign = async () => {
        if (!title || !goal || !duration)
            return toast.info("Please provide all values");
        if (!isActive) return toast.info("please, connect");
        try {
            setSendingTx(true);
            const tx = await proposeCampaign(
                title,
                parseEther(String(goal)),
                duration * 60
            );
            const receipt = await tx.wait();
            if (receipt.status === 0) return toast.error("tx failed");

            toast.success("campaign created!!");
            setIsOpen(false);
        } catch (error) {
            console.log("error: ", error);
            if (error.info.error.code === 4001) {
                return toast.error("You rejected the request");
            }
            toast.error("something went wrong");
        } finally {
            setSendingTx(false);
        }
    };
    return (
        <Fragment>
            <button
                onClick={openModal}
                className="w-[fit-content] block rounded-md mx-auto bg-blue-400 px-4 py-4 text-sm font-medium text-white hover:bg-opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
            >
                Create a Campaign
            </button>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-50" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        Create Campaign
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Type in your Campaign name, Crowndfund goal and Crowdfund time
                                        </p>
                                    </div>
                                    <form className="mt-4 space-y-4">
                                        <div className="flex flex-col">
                                            <label className="font-bold">
                                                Title
                                            </label>
                                            <input
                                                value={title}
                                                onChange={(e) =>
                                                    setTitle(e.target.value)
                                                }
                                                type="text"
                                                className="outline-0 py-2 px-1 rounded-lg mt-2 border border-blue-400"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="font-bold">
                                                Goal (ETH Amount)
                                            </label>
                                            <input
                                                value={goal}
                                                onChange={(e) =>
                                                    setGoal(
                                                        Number(e.target.value)
                                                    )
                                                }
                                                type="number"
                                                className="outline-0 py-2 px-1 rounded-lg mt-2 border border-blue-400"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="font-bold">
                                                 Campaign Duration(Minutes)
                                            </label>
                                            <input
                                                value={duration}
                                                onChange={(e) =>
                                                    setDuration(
                                                        Number(e.target.value)
                                                    )
                                                }
                                                type="number"
                                                className="outline-0 py-2 px-1 rounded-lg mt-2 border border-blue-400"
                                            />
                                        </div>

                                        {isActive ? (
                                            <div
                                                onClick={handleProposeCampaign}
                                                className="cursor-pointer w-full rounded-md bg-blue-400 p-3 text-sm font-medium text-white hover:bg-opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 text-center"
                                            >
                                                {sendingTx
                                                    ? "Creating Campaign..."
                                                    : "Create Campaign"}
                                            </div>
                                        ) : account ? (
                                            <div
                                                onClick={() =>
                                                    switchToChain(
                                                        supportedChains[0]
                                                    )
                                                }
                                                className="cursor-pointer w-full rounded-md bg-blue-400 p-3 text-sm font-medium text-white hover:bg-opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 text-center"
                                            >
                                                Switch to Sepolia
                                            </div>
                                        ) : (
                                            <div
                                                onClick={connect}
                                                disabled={sendingTx}
                                                className="cursor-pointer w-full rounded-md bg-blue-400 p-3 text-sm font-medium text-white hover:bg-opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 text-center"
                                            >
                                                Connect
                                            </div>
                                        )}
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </Fragment>
    );
};

export default CreateCampaign;
