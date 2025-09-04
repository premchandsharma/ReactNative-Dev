export interface TooltipProps {
  data: {
    _id: string;
    url: string;
    clickAction: string;
    deepLinkUrl: string;
    styling: any;
  };
  position: { x: number; y: number };
  size: { width: number; height: number };
  tooltipPosition: {
    tooltipX: number;
    tooltipY: number;
    arrowX: number;
    placement: 'top' | 'bottom';
  };
  styling: {
    tooltipWidth: number;
    tooltipHeight: number;
    highlightRadius: number;
    highlightPadding: number;
    arrowHeight: number;
    arrowWidth: number;
    cornerRadius: number;
    backgroundColor: string;
    enableBackdrop: boolean;
  };
  onClose: () => void;
  onTooltipClick: () => void;
}
