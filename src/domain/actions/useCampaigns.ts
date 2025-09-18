import useAppStorysStore from "../sdk/store";
import {useMemo} from "react";
import {Campaign} from "../sdk/types";

interface UseCampaignsOptions {
  position?: string;
}

export default function useCampaigns<T extends Campaign>(campaignType: string, options?: UseCampaignsOptions): T | undefined {
  const campaigns = useAppStorysStore((state) => state.campaigns);
  const trackedEvents = useAppStorysStore((state) => state.trackedEvents);

  return useMemo(
    () => {
      return campaigns.find((val) => {
        return val.campaign_type === campaignType &&
          (options?.position ? val.position === options.position : true) &&
          (val.trigger_event ? trackedEvents.includes(val.trigger_event) : true);
      }) as T | undefined;
    },
    [campaigns, trackedEvents, campaignType, options],
  );
}
