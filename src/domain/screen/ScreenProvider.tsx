import {useCallback, useRef} from 'react';
import {PixelRatio, Platform} from 'react-native';
import {ScreenProviderProps} from "./types";
import ScreenContext from "./ScreenContext";
import {MeasurementData} from "../capture/types";
import {EdgeInsets, useSafeAreaInsets} from "react-native-safe-area-context";

export default function ScreenProvider({name, options, children}: ScreenProviderProps) {
  const insets = useSafeAreaInsets();

  // Use a ref to store the registered components.
  // This prevents re-renders every time a component registers.
  const registeredRefs = useRef(new Map<string, any>());

  // A function for components to register themselves
  const register = useCallback((id: string, ref: any) => {
    registeredRefs.current.set(id, ref);
  }, []);

  // A function for components to unregister when they are removed
  const unregister = useCallback((id: string) => {
    registeredRefs.current.delete(id);
  }, []);

  const measureAll = useCallback(async () => {
    return new Promise<MeasurementData[]>((resolve) => {
      const data: MeasurementData[] = [];
      const refsToMeasure = Array.from(registeredRefs.current.entries());
      let measuredCount = 0;

      if (refsToMeasure.length === 0) {
        return resolve(data); // Return empty array if nothing to measure
      }

      refsToMeasure.forEach(([id, ref]) => {
        if (ref && typeof ref.measureInWindow === 'function') {
          ref.measureInWindow((x: number, y: number, width: number, height: number) => {
            data.push(getMeasurementData(id, x, y, width, height, insets));
          });
        } else {
          console.warn(`Could not measure component with id: ${id}`);
        }

        // We always increment the count, even if measureInWindow is not available
        // so that we don't hang the promise resolution.
        measuredCount++;
        if (measuredCount === refsToMeasure.length) {
          resolve(data);
        }
      });
    })
  }, [insets]);

  // Re-measure specific components by ID
  const measure = useCallback(async (id: string) => {
    const ref = registeredRefs.current.get(id);
    if (!ref || typeof ref.measureInWindow !== 'function') {
      return null;
    }

    return new Promise<MeasurementData | null>((resolve) => {
      ref.measureInWindow((x: number, y: number, width: number, height: number) => {
        resolve(getMeasurementData(id, x, y, width, height, insets));
      });
    });
  }, [insets]);

  return (
    <ScreenContext.Provider value={{
      name, options, context: {
        register,
        unregister,
        measure,
        measureAll,
      }
    }}>
      {children}
    </ScreenContext.Provider>
  );
}

function getMeasurementData(id: string, x: number, y: number, width: number, height: number, insets: EdgeInsets): MeasurementData {
  // Get status bar height and pixel ratio for accurate measurements
  const pixelRatio = PixelRatio.get();

  // Detect if we need to adjust for status bar
  // In edge-to-edge mode, we typically need to add statusBarHeight
  // You can also check this via your app's window insets configuration
  const statusBarAdjustment = Platform.OS === 'ios' || (Platform.OS === 'android' && Platform.Version >= 35) ? insets.top : 0;

  // Convert logical pixels to physical pixels
  const physicalX = x * pixelRatio;
  const physicalY = (y + statusBarAdjustment) * pixelRatio;
  const physicalWidth = width * pixelRatio;
  const physicalHeight = height * pixelRatio;

  return {
    id,
    size: {
      width: physicalWidth,
      height: physicalHeight,
      logicalWidth: width,
      logicalHeight: height,
    },
    position: {
      x: physicalX,
      y: physicalY,
      logicalX: x,
      logicalY: Platform.OS === 'android' ? y + statusBarAdjustment : y - statusBarAdjustment,
    },
    pixelRatio,
  }
}
