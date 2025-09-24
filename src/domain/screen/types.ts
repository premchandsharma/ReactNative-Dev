import {MeasurementData} from "../capture/types";
import {ReactNode} from "react";

export interface ComponentPadding {
  top?: number;
  bottom?: number;
}

export interface ScreenOptions {
  positionList?: Array<string>;
  overlayPadding?: number | ComponentPadding | {
    pip?: number | ComponentPadding;
    floater?: number;
    banner?: number;
    csat?: number;
  };
}

export interface ScreenProviderProps {
  name: string;
  options?: ScreenOptions;
  children: ReactNode;
}

export interface ScreenContextValue {
  name: string;
  options?: ScreenOptions;
  context: ScreenContextType;
}

export interface ScreenContextType {
  register: (id: string, ref: any) => void;
  unregister: (id: string) => void;
  measure: (id: string) => Promise<MeasurementData | null>;
  measureAll: () => Promise<MeasurementData[]>;
}
