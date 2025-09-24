import {useMemo} from "react";
import useScreen from "../screen/useScreen";
import {ComponentPadding} from "../screen/types";

export default function usePadding(campaignType: string): ComponentPadding | null {
  const padding = useScreen().options?.overlayPadding;

  return useMemo(
    () => {
      if (typeof padding === 'number') {
        return {top: padding, bottom: padding};
      } else if (typeof padding === 'object') {
        if ('top' in padding || 'bottom' in padding) {
          return padding;
        } else if (campaignType === 'PIP' && 'pip' in padding) {
          if (typeof padding.pip === 'number') {
            return {top: padding.pip, bottom: padding.pip};
          }
          return padding.pip || null;
        } else if (campaignType === 'FLT' && 'floater' in padding) {
          return {top: padding.floater, bottom: padding.floater};
        } else if (campaignType === 'BAN' && 'banner' in padding) {
          return {top: padding.banner, bottom: padding.banner};
        } else if (campaignType === 'CSAT' && 'csat' in padding) {
          return {top: padding.csat, bottom: padding.csat};
        }
      }
      return null;
    },
    [padding, campaignType],
  );
}
