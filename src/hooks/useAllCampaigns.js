import { useEffect, useState } from "react";
import useCampaignCount from "./useCampaignCount";
import { useConnection } from "../context/connection";
import {
    getCrowdFundInterface,
    getCrowdfundContractWithProvider,
    getMulticall2ContractWithProvider,
} from "../utils";
import { crowdfundContractAddress } from "../constants/addresses";

const useAllCampaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const { provider } = useConnection();
    const campaignNo = useCampaignCount();

    useEffect(() => {
        const fetchAllCampaigns = async () => {
            if (!campaignNo) return;
            try {
                const multicall2Contract =
                    getMulticall2ContractWithProvider(provider);

                const campaignsKeys = Array.from(
                    { length: Number(campaignNo) },
                    (_, i) => i + 1
                );

                const croundFundInterface = getCrowdFundInterface();

                const campaignCalls = campaignsKeys.map((id) => ({
                    target: crowdfundContractAddress,
                    callData: croundFundInterface.encodeFunctionData("crowd", [
                        id,
                    ]),
                }));

                const constributorsCall = campaignsKeys.map((id) => ({
                    target: crowdfundContractAddress,
                    callData: croundFundInterface.encodeFunctionData(
                        "getContributors",
                        [id]
                    ),
                }));

                const calls = campaignCalls.concat(constributorsCall);
                const multicallResults = (
                    await multicall2Contract.aggregate.staticCall(calls)
                )[1].toArray();

                const campaignMulticallResult = multicallResults.slice(
                    0,
                    multicallResults.length / 2
                );
                const contributorsMulticallResult = multicallResults.slice(
                    multicallResults.length / 2
                );

                const decodedCampaignResults = campaignMulticallResult.map(
                    (result) =>
                        croundFundInterface
                            .decodeFunctionResult("crowd", result)
                            .toArray()
                );

                const decodedContributorsResults =
                    contributorsMulticallResult.map((result) =>
                        croundFundInterface
                            .decodeFunctionResult("getContributors", result)
                            .toArray()
                    );

                const campaignDetails = decodedCampaignResults.map(
                    (details, index) => ({
                        id: campaignsKeys[index],
                        title: details[0],
                        fundingGoal: details[1],
                        owner: details[2],
                        durationTime: Number(details[3]),
                        isActive: details[4],
                        fundingBalance: details[5],
                        contributors:
                            decodedContributorsResults[index][0].toArray(),
                    })
                );

                setCampaigns(campaignDetails.reverse());
            } catch (error) {
                console.error("Error fetching campaigns:", error);
            }
        };

        fetchAllCampaigns();
    }, [campaignNo, provider]);

    useEffect(() => {
        // Listen for event
        const handleProposeCampaignEvent = (id, title, amount, duration) => {
            setCampaigns([
                {
                    id,
                    title,
                    fundingGoal: amount,
                    durationTime: Number(duration),
                    isActive: true,
                    fundingBalance: 0,
                    contributors: [],
                },
                ...campaigns,
            ]);
        };
        const contract = getCrowdfundContractWithProvider(provider);
        contract.on("ProposeCampaign", handleProposeCampaignEvent);

        return () => {
            contract.off("ProposeCampaign", handleProposeCampaignEvent);
        };
    }, [campaigns, provider]);

    return campaigns;
};

export default useAllCampaigns;
