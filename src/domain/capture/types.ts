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

export interface MeasurementContextType {
  register: (id: string, ref: any) => void;
  unregister: (id: string) => void;
  measure: (id: string) => Promise<MeasurementData | null>;
  measureAll: () => Promise<MeasurementData[]>;
}

export interface MeasurementData {
  id: string;
  size: {
    width: number;        // Physical width in pixels
    height: number;       // Physical height in pixels
    logicalWidth: number; // Logical width in dp
    logicalHeight: number;// Logical height in dp
  };
  position: {
    x: number;           // Physical x position in pixels
    y: number;           // Physical y position in pixels
    logicalX: number;    // Logical x position in dp
    logicalY: number;    // Logical y position in dp
  };
  pixelRatio: number;    // Device pixel ratio
}