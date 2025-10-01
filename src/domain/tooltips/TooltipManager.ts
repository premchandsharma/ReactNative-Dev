import React from 'react';
import {Dimensions, Linking} from 'react-native';
import {CampaignTooltips, Tooltip, TooltipPosition} from './types';
import {MeasurementData} from '../capture/types';
import TooltipComponent from '../../components/tooltip';
import trackEvent from "../actions/trackEvent";
import {Campaign} from "../sdk/types";

class TooltipManager {
  private static instance: Record<string, TooltipManager> = {};

  private readonly screenName: string;
  private tooltips: Array<Tooltip> = [];
  private currentTooltipIndex = 0;
  private isProcessing = false;
  private onShowTooltip?: (id: string, tooltipComponent: React.ReactElement) => void;
  private onHideTooltip?: () => void;
  private measure?: (id: string) => Promise<MeasurementData | null>;

  private constructor(screen: string) {
    this.screenName = screen;
  }

  static getInstance(screen: string): TooltipManager {
    if (!TooltipManager.instance[screen]) {
      TooltipManager.instance[screen] = new TooltipManager(screen);
    }
    return TooltipManager.instance[screen];
  }

  setMeasurementFunction(measure: (id: string) => Promise<MeasurementData | null>) {
    this.measure = measure;
  }

  setTooltipHandlers(
    onShow: (id: string, tooltipComponent: React.ReactElement) => void,
    onHide: () => void
  ) {
    this.onShowTooltip = onShow;
    this.onHideTooltip = onHide;
  }

  async processTooltips(campaigns: Campaign[]) {
    if (!this.measure || !this.onShowTooltip || !this.onHideTooltip) {
      console.warn('TooltipManager not fully initialized. Missing measurement function or handlers.');
      return;
    }

    const tooltipCampaigns = campaigns.filter(
      (campaign) => campaign.screen === this.screenName && campaign.campaign_type === 'TTP'
    );

    if (tooltipCampaigns.length === 0) return;

    this.reset();

    for (let i = 0; i < tooltipCampaigns.length; i++) {
      const campaign = tooltipCampaigns[i] as CampaignTooltips;
      const tooltips = campaign.details.tooltips.map((tooltip) => ({
        ...tooltip,
        campaignId: campaign.id,
      }));
      this.tooltips = [...this.tooltips, ...tooltips];
    }

    try {
      if (this.tooltips.length > 0) {
        // Small delay to ensure UI is ready
        setTimeout(() => {
          this.showNextTooltip();
        }, 1000);
      }
    } catch (error) {
      console.error('Error measuring elements for tooltips:', error);
    }
  }

  // used to re-show the current tooltip after a layout change
  reshowCurrentTooltip() {
    this.isProcessing = false;
    return this.showNextTooltip();
  }

  reset() {
    this.tooltips = [];
    this.currentTooltipIndex = 0;
    this.isProcessing = false;
    this.onHideTooltip?.();
  }

  private async showNextTooltip() {
    if (this.isProcessing || this.currentTooltipIndex >= this.tooltips.length) {
      return;
    }

    const tooltip = this.tooltips[this.currentTooltipIndex];
    if (!tooltip) {
      return this.onTooltipClosed();
    }

    const targetElement = await this.measure!(tooltip?.target);
    if (!targetElement) {
      return this.onTooltipClosed();
    }

    this.isProcessing = true;
    this.showOverlay(targetElement, tooltip);
  }

  private onTooltipClosed() {
    console.log('Tooltip closed');
    this.onHideTooltip?.();
    this.currentTooltipIndex++;
    this.isProcessing = false;

    if (this.currentTooltipIndex < this.tooltips.length) {
      setTimeout(() => {
        void this.showNextTooltip();
      }, 300);
    } else {
      this.reset();
    }
  }

  private showOverlay(targetElement: MeasurementData, data: Tooltip) {
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
      void trackEvent('viewed', data.campaignId, {
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
      });

      this.onShowTooltip?.(data.target, tooltipComponent);
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
    }: {
      data: Tooltip;
      position: { x: number; y: number };
      size: { width: number; height: number };
      tooltipPosition: TooltipPosition;
      styling: any;
    }
  ): React.ReactElement {
    return React.createElement(TooltipComponent, {
      key: data._id,
      data,
      position,
      size,
      tooltipPosition,
      styling,
      onClose: () => this.onTooltipClosed(),
      onTooltipClick: () => this.handleClick(data),
    });
  }

  private handleClick(tooltipData: Tooltip) {
    const clickAction = tooltipData.clickAction;
    const link = tooltipData.deepLinkUrl;

    void trackEvent('clicked', tooltipData.campaignId, {
      "tooltip_id": tooltipData._id,
    });

    if (clickAction === 'deepLink' && link && link.trim() !== '') {
      Linking.openURL(link).catch(err => {
        console.error('Failed to open URL:', err);
      });
    }

    this.onTooltipClosed();
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
