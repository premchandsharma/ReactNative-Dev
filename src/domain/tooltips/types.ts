export type CampaignTooltips = {
  id: string;
  campaign_type: 'TTP';
  details: CampaignTooltipsDetails;
};

export type CampaignTooltipsDetails = {
  _id: string;
  campaign: string;
  created_at: string;
  name: string;
  screenId: string;
  tooltips: Array<Tooltip>;
};

export type Tooltip = {
  _id: string;
  clickAction: string;
  deepLinkUrl: string;
  eventName: string;
  link: string;
  order: number;
  position: string;
  styling: {
    backgroundColor: string;
    closeButton: boolean;
    enableBackdrop: boolean;
    highlightPadding: string;
    highlightRadius: string;
    spacing: {
      paddingBottom: string;
      paddingLeft: string;
      paddingRight: string;
      paddingTop: string;
    };
    tooltipArrow: {
      arrowHeight: string;
      arrowWidth: string;
    };
    tooltipDimensions: {
      cornerRadius: string;
      height: string;
      width: string;
    };
  };
  target: string;
  triggerType: string;
  type: string;
  url: string;

  // additional fields for internal use
  campaignId?: string;
}

export type TooltipPosition = {
  tooltipX: number;
  tooltipY: number;
  arrowX: number;
  placement: 'top' | 'bottom';
}
