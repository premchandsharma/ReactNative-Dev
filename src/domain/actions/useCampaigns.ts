import useAppStorysStore from "../sdk/store";
import {useMemo} from "react";
import {Campaign} from "../sdk/types";

export default function useCampaigns<T extends Campaign>(campaignType: string) {
  const campaigns = useAppStorysStore((state) => state.campaigns);

  return useMemo(
    () => campaigns.find((val) => val.campaign_type === campaignType) as T | undefined,
    [campaigns, campaignType],
  );
}
