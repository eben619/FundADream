import { useCallback } from "react";
import { useConnection } from "../context/connection";
import { calculateGasMargin, getCrowdfundContract } from "../utils";
import useCampaignCount from "./useCampaignCount";
import { toast } from "react-toastify";

const useContribute = () => {
    const { provider, isActive } = useConnection();
    const campaignLength = useCampaignCount();
    const contribute = useCallback(
        async (id, amount) => {
            console.log({ amount });
            if (!isActive || !provider) return;
            if (!campaignLength) return;
            if (Number(id) > campaignLength)
                return toast.error("campaign does not exist");
            const contract = await getCrowdfundContract(provider, true);

            const estimatedGas = await contract.contributeEth.estimateGas(
                Number(id),
                {
                    value: amount,
                }
            );

            return contract.contributeEth(Number(id), {
                value: amount,
                gasLimit: calculateGasMargin(estimatedGas),
            });
        },
        [campaignLength, isActive, provider]
    );

    return contribute;
};

export default useContribute;
