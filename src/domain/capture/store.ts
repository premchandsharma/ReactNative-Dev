import {create} from "zustand/react";
import {CaptureServiceActions, CaptureServiceStore} from "./types";

export const useCaptureServiceStore = create<CaptureServiceStore & CaptureServiceActions>((set) => ({
  isCapturing: {},
  isScreenCaptureEnabled: {},
  setIsCapturing: (screenName, capturing) => set((state) => ({
    isCapturing: {
      ...state.isCapturing,
      [screenName]: capturing,
    }
  })),
  setScreenCaptureEnabled: (screenName, enabled) => set((state) => ({
    isScreenCaptureEnabled: {
      ...state.isScreenCaptureEnabled,
      [screenName]: enabled,
    }
  })),
}));
