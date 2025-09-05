import React, {useCallback, useRef} from 'react';
import {PixelRatio, StatusBar} from 'react-native';
import MeasurementContext from './MeasurementContext';
import {MeasurementData} from "./types";
import TooltipConsumer from "../../components/tooltip/consumer";

export default function MeasurementProvider({children}: { children: React.ReactNode }) {
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

      // Get status bar height and pixel ratio for accurate measurements
      const statusBarHeight = StatusBar.currentHeight || 0;
      const pixelRatio = PixelRatio.get();

      // const screenData = Dimensions.get('screen');
      // console.log(`Screen info - Logical: ${screenData.width}x${screenData.height}, PixelRatio: ${pixelRatio}, Physical: ${screenData.width * pixelRatio}x${screenData.height * pixelRatio}`);

      refsToMeasure.forEach(([id, ref]) => {
        if (ref && typeof ref.measureInWindow === 'function') {
          ref.measureInWindow((x: number, y: number, width: number, height: number) => {
            // Convert logical pixels to physical pixels
            const physicalX = x * pixelRatio;
            const physicalY = (y + statusBarHeight) * pixelRatio;
            const physicalWidth = width * pixelRatio;
            const physicalHeight = height * pixelRatio;

            data.push({
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
                logicalY: y + statusBarHeight,
              },
              pixelRatio,
            });
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
  }, []);

  return (
    <MeasurementContext.Provider value={{register, unregister, measureAll}}>
      {children}
      <TooltipConsumer/>
    </MeasurementContext.Provider>
  );
}
