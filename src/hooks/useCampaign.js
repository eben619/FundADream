import { useCallback, useEffect, useState } from "react";
import useCampaignCount from "./useCampaignCount";
import { useConnection } from "../context/connection";
import {
    getCrowdFundInterface,
    getCrowdfundContractWithProvider,
    getMulticall2ContractWithProvider,
} from "../utils";
import { crowdfundContractAddress } from "../constants/addresses";

const useCampaign = (id) => {
    const [campaign, setCampaign] = useState(null);
    const [state, setState] = useState("LOADING");
    const { provider } = useConnection();
    const campaignLength = useCampaignCount();

    const fetchCampaign = useCallback(async () => {
        const campaignId = Number(id);
        if (!campaignLength) return;
        if (!campaignId || campaignId > campaignLength)
            return setState("NOT_FOUND");
        try {
            const multicall2Contract =
                getMulticall2ContractWithProvider(provider);

            const croundFundInterface = getCrowdFundInterface();

            const calls = [
                {
                    target: crowdfundContractAddress,
                    callData: croundFundInterface.encodeFunctionData("crowd", [
                        campaignId,
                    ]),
                },
                {
                    target: crowdfundContractAddress,
                    callData: croundFundInterface.encodeFunctionData(
                        "getContributors",
                        [campaignId]
                    ),
                },
            ];

            const callsResult = (
                await multicall2Contract.aggregate.staticCall(calls)
            )[1].toArray();

            const campaign = croundFundInterface
                .decodeFunctionResult("crowd", callsResult[0])
                .toArray();
            const campaignContributors = croundFundInterface
                .decodeFunctionResult("getContributors", callsResult[1])
                .toArray();

            const campaignDetails = {
                id: campaignId,
                title: campaign[0],
                fundingGoal: campaign[1],
                owner: campaign[2],
                durationTime: Number(campaign[3]),
                isActive: campaign[4],
                fundingBalance: campaign[5],
                contributors: campaignContributors[0].toArray(),
            };

            setCampaign(campaignDetails);
            setState("LOADED");
        } catch (error) {
            console.error("Error fetching campaigns:", error);
            setState("NOT_FOUND");
        }
    }, [campaignLength, id, provider]);

    useEffect(() => {
        fetchCampaign();
    }, [campaignLength, fetchCampaign, id, provider]);

    useEffect(() => {
        // Listen for event
        const handleContributeEthEvent = (_ID) => {
            fetchCampaign();
        };

        const contract = getCrowdfundContractWithProvider(provider);
        contract.on("ContributeEth", handleContributeEthEvent);

        return () => {
            contract.off("ContributeEth", handleContributeEthEvent);
        };
    }, [fetchCampaign, provider]);
    return { campaign, state };
};

export default useCampaign;
