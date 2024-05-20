import { useEffect, useState } from "react";
import { useConnection } from "../context/connection";
import { getCrowdfundContract } from "../utils";

const useCampaignCount = () => {
    const [campaignCount, setCampaignCount] = useState(0);
    const { provider } = useConnection();

    useEffect(() => {
        const fetchCampaignCount = async () => {
            try {
                const contract = await getCrowdfundContract(provider, false);
                const count = await contract.id();
                setCampaignCount(Number(count));
            } catch (error) {
                console.error("Error fetching campaign count:", error);
            }
        };

        fetchCampaignCount();
    }, [provider]);
    return campaignCount;
};

export default useCampaignCount;
