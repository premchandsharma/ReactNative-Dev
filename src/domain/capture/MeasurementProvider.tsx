import React, {useCallback, useRef} from 'react';
import {PixelRatio, Platform, StatusBar} from 'react-native';
import MeasurementContext from './MeasurementContext';
import {MeasurementData} from "./types";
import TooltipConsumer from "../../components/tooltip/consumer";
import Modal from '../../components/Modal';
import Banner from '../../components/Banner';
import Floater from '../../components/Floater';
import Csat from '../../components/Csat';
import BottomSheet from '../../components/BottomSheet';
import Survey from '../../components/Survey';
import CaptureScreenButton from '../../components/CaptureScreenButton';

interface MeasurementProviderProps {
  children: React.ReactNode;
}

export default function MeasurementProvider({children}: MeasurementProviderProps) {
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
            data.push(getMeasurementData(id, x, y, width, height));
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

  // Re-measure specific components by ID
  const measure = useCallback(async (id: string) => {
    const ref = registeredRefs.current.get(id);
    if (!ref || typeof ref.measureInWindow !== 'function') {
      return null;
    }

    return new Promise<MeasurementData | null>((resolve) => {
      ref.measureInWindow((x: number, y: number, width: number, height: number) => {
        resolve(getMeasurementData(id, x, y, width, height));
      });
    });
  }, []);

  return (
    <MeasurementContext.Provider value={{register, unregister, measureAll, measure}}>
      {children}
      <Banner/>
      <Floater/>
      {/* <Pip/> */}
      <Csat/>
      <TooltipConsumer/>
      <Survey/>
      <BottomSheet/>
      <Modal/>
      <CaptureScreenButton/>
    </MeasurementContext.Provider>
  );
}

function getMeasurementData(id: string, x: number, y: number, width: number, height: number): MeasurementData {
  // Get status bar height and pixel ratio for accurate measurements
  const statusBarHeight = StatusBar.currentHeight || 0;
  const pixelRatio = PixelRatio.get();

  // Detect if we need to adjust for status bar
  // In edge-to-edge mode, we typically need to add statusBarHeight
  // You can also check this via your app's window insets configuration
  const statusBarAdjustment = Platform.OS === 'android' && Platform.Version >= 35 ? statusBarHeight : 0;

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
      logicalY: y + statusBarAdjustment,
    },
    pixelRatio,
  }
}
