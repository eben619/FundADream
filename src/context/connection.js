import { createContext, useContext, useEffect, useState } from "react";
import { getReadOnlyProvider, isSupportedChain } from "../utils";
import { defaultReadonlyChainId, networkInfoMap } from "../constants";
import { ethers } from "ethers";
import { toast } from "react-toastify";

const Connection = createContext();

const ConnectionProvider = ({ children }) => {
    const [account, setAccount] = useState();
    const [chainId, setChainId] = useState();
    const [isActive, setIsActive] = useState(false);
    const [provider, setProvider] = useState(
        getReadOnlyProvider(defaultReadonlyChainId)
    );

    const connect = async () => {
        if (window.ethereum === undefined)
            return toast.info("Use ethereum-enabled browser");
        try {
            return window.ethereum.request({
                method: "eth_requestAccounts",
            });
        } catch (error) {
            console.log("error: ", error);
        }
    };

    const handleAccountChanged = async (accounts) => {
        if (!accounts.length) {
            setAccount(undefined);
            setChainId(undefined);
            setIsActive(false);
            return setProvider(getReadOnlyProvider(defaultReadonlyChainId));
        }
        const chain = await window.ethereum.request({
            method: "eth_chainId",
        });

        setAccount(accounts[0]);
        setChainId(Number(chain));
        if (isSupportedChain(chain)) {
            setIsActive(true);
            setProvider(new ethers.BrowserProvider(window.ethereum));
        } else {
            setProvider();
            setIsActive(false);
            setProvider(getReadOnlyProvider(defaultReadonlyChainId));
        }
    };

    const handleChainChanged = (chain) => {
        setChainId(Number(chain));
        if (isSupportedChain(chain)) {
            setIsActive(true);
            setProvider(new ethers.BrowserProvider(window.ethereum));
        } else {
            setIsActive(false);
            setProvider(getReadOnlyProvider(defaultReadonlyChainId));
        }
    };

    const eagerlyConnect = async () => {
        if (window.ethereum === undefined) return;
        const accounts = await window?.ethereum?.request({
            method: "eth_accounts",
        });

        if (!accounts.length) return;

        handleAccountChanged(accounts);
    };

    useEffect(() => {
        if (window.ethereum === undefined) return;
        eagerlyConnect();
        window.ethereum.on("chainChanged", handleChainChanged);

        window.ethereum.on("accountsChanged", handleAccountChanged);

        return () => {
            window.ethereum.removeListener(
                "accountsChanged",
                handleAccountChanged
            );

            window.ethereum.removeListener("chainChanged", handleChainChanged);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const switchToChain = async (chain) => {
        if (!isSupportedChain(chain))
            return toast.error("attempt to switch to a wrong chain!");
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: `0x${chain.toString(16)}` }],
            });
        } catch (error) {
            if (error.code === 4902 || error.code === -32603) {
                const chainInfo = networkInfoMap[chain];
                try {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [chainInfo],
                    });
                } catch (addError) {
                    toast.error("you rejected network addition!");
                }
            }
        }
    };

    return (
        <Connection.Provider
            value={{
                account,
                chainId,
                isActive,
                provider,
                connect,
                switchToChain,
            }}
        >
            {children}
        </Connection.Provider>
    );
};

export const useConnection = () => useContext(Connection);

export default ConnectionProvider;
