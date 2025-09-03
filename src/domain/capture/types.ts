export interface LayoutFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutInfo {
  id: string;
  frame: LayoutFrame;
}

export interface CaptureServiceStore {
  isCapturing: boolean;
  isScreenCaptureEnabled: boolean;
}

export interface CaptureServiceActions {
  setScreenCaptureEnabled: (enabled: boolean) => void;
  setIsCapturing: (capturing: boolean) => void;
}
