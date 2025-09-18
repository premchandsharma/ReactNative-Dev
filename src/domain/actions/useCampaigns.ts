import useAppStorysStore from "../sdk/store";
import {useMemo} from "react";
import {Campaign} from "../sdk/types";

interface UseCampaignsOptions {
  position?: string;
}

export default function useCampaigns<T extends Campaign>(campaignType: string, options?: UseCampaignsOptions): T | undefined {
  const campaigns = useAppStorysStore((state) => state.campaigns);

  return useMemo(
    () => {
      return campaigns.find((val) => {
        return val.campaign_type === campaignType && (options?.position ? (val as any).position === options.position : true);
      }) as T | undefined;
    },
    [campaigns, campaignType, options],
  );
}
