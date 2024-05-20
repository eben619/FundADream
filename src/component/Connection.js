import React, { Fragment } from "react";
import { useConnection } from "../context/connection";
import { shortenAccount } from "../utils";
import { networkInfoMap, supportedChains } from "../constants";
import { Menu, Transition } from "@headlessui/react";
import useBalance from "../hooks/useBalance";

const Connection = () => {
    const { account, chainId, isActive, connect, switchToChain } =
        useConnection();
    const ethBalance = useBalance(account);

    if (!account)
        return (
            <button
                onClick={connect}
                className="inline-flex justify-center rounded-md bg-blue-400 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
            >
                Connect
            </button>
        );
    return (
        <div className="flex gap-2 items-center">
            <div className="flex gap-2 items-center font-bold">
                <span>{`${Number(ethBalance).toFixed(2)}ETH`}</span>
                <span>{shortenAccount(account)}</span>
            </div>
            <div className="flex gap-2 items-center">
                <div className="relative text-right">
                    <Menu as="div" className="relative inline-block text-left">
                        <div>
                            <Menu.Button className="inline-flex w-full justify-center rounded-md bg-blue-400 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                                {isActive
                                    ? networkInfoMap[chainId]?.chainName
                                    : "Networks"}
                            </Menu.Button>
                        </div>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="px-1 py-1 ">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() =>
                                                    switchToChain(
                                                        supportedChains[0]
                                                    )
                                                }
                                                className={`${
                                                    active
                                                        ? "bg-blue-400 text-white"
                                                        : "text-gray-900"
                                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                            >
                                                {
                                                    networkInfoMap[
                                                        supportedChains[0]
                                                    ].chainName
                                                }
                                            </button>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() =>
                                                    switchToChain(
                                                        supportedChains[1]
                                                    )
                                                }
                                                className={`${
                                                    active
                                                        ? "bg-blue-400 text-white"
                                                        : "text-gray-900"
                                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                            >
                                                {
                                                    networkInfoMap[
                                                        supportedChains[1]
                                                    ].chainName
                                                }
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            </div>
        </div>
    );
};

export default Connection;
