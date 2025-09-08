import React from 'react';
import {Dimensions, Linking} from 'react-native';
import {CampaignTooltips, Tooltip, TooltipPosition} from './types';
import {MeasurementData} from '../capture/types';
import TooltipComponent from '../../components/tooltip';
import trackEvent from "../actions/trackEvent";
import {Campaign} from "../sdk/types";

class TooltipManager {
  private static instance: TooltipManager;
  private tooltipQueue: Array<{ data: Tooltip; element: MeasurementData }> = [];
  private currentTooltipIndex = 0;
  private isProcessing = false;
  private onShowTooltip?: (tooltipComponent: React.ReactElement) => void;
  private onHideTooltip?: () => void;
  private measureAll?: () => Promise<MeasurementData[]>;

  static getInstance(): TooltipManager {
    if (!TooltipManager.instance) {
      TooltipManager.instance = new TooltipManager();
    }
    return TooltipManager.instance;
  }

  setMeasurementFunction(measureAll: () => Promise<MeasurementData[]>) {
    this.measureAll = measureAll;
  }

  setTooltipHandlers(
    onShow: (tooltipComponent: React.ReactElement) => void,
    onHide: () => void
  ) {
    this.onShowTooltip = onShow;
    this.onHideTooltip = onHide;
  }

  async processTooltips(campaigns: Campaign[]) {
    if (!this.measureAll || !this.onShowTooltip || !this.onHideTooltip) {
      console.warn('TooltipManager not fully initialized. Missing measurement function or handlers.');
      return;
    }

    const tooltipCampaigns = campaigns.filter(
      (campaign) => campaign.campaign_type === 'TTP'
    );

    if (tooltipCampaigns.length === 0) return;

    const tooltipCampaign = tooltipCampaigns[0] as CampaignTooltips;
    const tooltips = tooltipCampaign.details.tooltips;

    this.reset();

    try {
      const measurements = await this.measureAll();

      for (const tooltipData of tooltips) {
        const target = tooltipData.target;
        const targetElement = measurements.find(m => m.id === target);

        if (targetElement) {
          this.tooltipQueue.push({data: tooltipData, element: targetElement});
        } else {
          console.warn(`Target element "${target}" not found in measurements`);
        }
      }

      if (this.tooltipQueue.length > 0) {
        // Small delay to ensure UI is ready
        setTimeout(() => {
          this.showNextTooltip(tooltipCampaign.id);
        }, 1000);
      }
    } catch (error) {
      console.error('Error measuring elements for tooltips:', error);
    }
  }

  reset() {
    this.tooltipQueue = [];
    this.currentTooltipIndex = 0;
    this.isProcessing = false;
    this.onHideTooltip?.();
  }

  private async showNextTooltip(campaignId: string) {
    if (this.isProcessing || this.currentTooltipIndex >= this.tooltipQueue.length) {
      return;
    }

    const tooltipInfo = this.tooltipQueue[this.currentTooltipIndex];
    const targetElement = tooltipInfo?.element;
    const tooltipData = tooltipInfo?.data;

    if (!targetElement || !tooltipData) {
      return
    }

    this.isProcessing = true;
    this.showOverlay(targetElement, tooltipData,campaignId);
  }

  private onTooltipClosed(campaignId: string) {
    console.log('Tooltip closed');
    this.onHideTooltip?.();
    this.currentTooltipIndex++;
    this.isProcessing = false;

    if (this.currentTooltipIndex < this.tooltipQueue.length) {
      setTimeout(() => {
        void this.showNextTooltip(campaignId);
      }, 300);
    } else {
      this.reset();
    }
  }

  private showOverlay(targetElement: MeasurementData, data: Tooltip, campaignId: string) {
    try {
      const screenSize = Dimensions.get('window');

      const position = {
        x: targetElement.position.logicalX,
        y: targetElement.position.logicalY
      };
      const size = {
        width: targetElement.size.logicalWidth,
        height: targetElement.size.logicalHeight
      };

      const styling = data.styling;
      const tooltipWidth = parseFloat(styling.tooltipDimensions.width);
      const tooltipHeight = parseFloat(styling.tooltipDimensions.height);
      const highlightRadius = parseFloat(styling.highlightRadius);
      const highlightPadding = parseFloat(styling.highlightPadding);
      const arrowHeight = parseFloat(styling.tooltipArrow.arrowHeight);
      const arrowWidth = parseFloat(styling.tooltipArrow.arrowWidth);
      const cornerRadius = parseFloat(styling.tooltipDimensions.cornerRadius);
      const backgroundColor = styling.backgroundColor;
      const enableBackdrop = styling.enableBackdrop;

      const tooltipPosition = this.calculatePosition({
        position,
        size,
        screenSize,
        tooltipWidth,
        arrowSize: arrowHeight,
        padding: highlightPadding,
      });

      // Track tooltip view event
      void trackEvent('viewed', campaignId, {
        "tooltip_id": data._id
      });

      // Create tooltip component
      const tooltipComponent = this.createTooltipComponent({
        data,
        position,
        size,
        tooltipPosition,
        styling: {
          tooltipWidth,
          tooltipHeight,
          highlightRadius,
          highlightPadding,
          arrowHeight,
          arrowWidth,
          cornerRadius,
          backgroundColor,
          enableBackdrop,
        },
        campaignId
      });

      this.onShowTooltip?.(tooltipComponent);
    } catch (error) {
      console.error('Error showing tooltip overlay:', error);
    }
  }

  private createTooltipComponent(
    {
      data,
      position,
      size,
      tooltipPosition,
      styling,
      campaignId
    }: {
      data: Tooltip;
      position: { x: number; y: number };
      size: { width: number; height: number };
      tooltipPosition: TooltipPosition;
      styling: any;
      campaignId: string;
    }
  ): React.ReactElement {
    return React.createElement(TooltipComponent, {
      key: data._id,
      data,
      position,
      size,
      tooltipPosition,
      styling,
      onClose: () => this.onTooltipClosed(campaignId),
      onTooltipClick: () => this.handleClick(data, campaignId),
    });
  }

  private handleClick(tooltipData: Tooltip, campaignId: string) {
    const clickAction = tooltipData.clickAction;
    const link = tooltipData.deepLinkUrl;

    void trackEvent('clicked', campaignId, {
      "tooltip_id": tooltipData._id,
    });

    if (clickAction === 'deepLink' && link && link.trim() !== '') {
      Linking.openURL(link).catch(err => {
        console.error('Failed to open URL:', err);
      });
    }

    this.onTooltipClosed(campaignId);
  }

  private calculatePosition(
    {
      position,
      size,
      screenSize,
      tooltipWidth,
      arrowSize,
      padding,
    }: {
      position: { x: number; y: number };
      size: { width: number; height: number };
      screenSize: { width: number; height: number };
      tooltipWidth: number;
      arrowSize: number;
      padding: number;
    }
  ): TooltipPosition {
    let placement: 'top' | 'bottom' = 'bottom';

    const centerX = position.x + (size.width / 2);

    let tooltipX = centerX - (tooltipWidth / 2);
    let tooltipY = position.y + size.height + arrowSize + padding;
    let arrowX = centerX;

    // Ensure tooltip stays within screen bounds
    if (tooltipX + tooltipWidth > screenSize.width - 10) {
      tooltipX = screenSize.width - tooltipWidth - 10;
    }

    if (tooltipX < 10) {
      tooltipX = 10;
    }

    // Constrain arrow position
    const minArrowX = tooltipX + 20;
    const maxArrowX = tooltipX + tooltipWidth - 20;
    arrowX = Math.max(minArrowX, Math.min(maxArrowX, arrowX));

    // Check if tooltip fits below, otherwise place above
    const tooltipHeightEstimate = 100;
    if (tooltipY + tooltipHeightEstimate > screenSize.height - 10) {
      placement = 'top';
      tooltipY = position.y - tooltipHeightEstimate - arrowSize - padding;
    }

    return {
      tooltipX,
      tooltipY,
      arrowX,
      placement,
    };
  }
}

export default TooltipManager;
