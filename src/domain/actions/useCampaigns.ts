import useAppStorysStore from "../sdk/store";
import {useMemo} from "react";
import {Campaign} from "../sdk/types";
import useScreen from "../screen/useScreen";

interface UseCampaignsOptions {
  position?: string;
}

export default function useCampaigns<T extends Campaign>(campaignType: string, options?: UseCampaignsOptions): T | undefined {
  const screen = useScreen().name;
  const campaigns = useAppStorysStore((state) => state.campaigns);
  const trackedEvents = useAppStorysStore((state) => state.trackedEvents);

  return useMemo(
    () => {
      return campaigns?.find((campaign) => {
        return campaign.screen === screen &&
          campaign.campaign_type === campaignType &&
          (options?.position ? campaign.position === options.position : true) &&
          (campaign.trigger_event ? trackedEvents.includes(campaign.trigger_event) : true);
      }) as T | undefined;
    },
    [campaigns, trackedEvents, campaignType, options, screen],
  );
}
