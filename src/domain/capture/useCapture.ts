import {useCallback, useContext} from "react";
import CaptureService from "./CaptureService";
import {Alert} from "react-native";
import MeasurementContext from "./MeasurementContext";

export default function useCapture(screenName: string) {
  const {measureAll} = useContext(MeasurementContext);
  return useCallback(async () => {
    try {
      if (CaptureService.getIsCapturing()) {
        Alert.alert('Info', 'Capture is already in progress');
        return;
      }

      const measurements = await measureAll();

      CaptureService.clearLayoutData();
      measurements.forEach(({id, size, position}) => {
        CaptureService.addLayoutInfo(id, {
          x: position.x,
          y: position.y,
          width: size.width,
          height: size.height,
        });
      });

      const success = await CaptureService.takeScreenshot(screenName);

      if (success) {
        Alert.alert('Success', 'Screen captured successfully');
      } else {
        Alert.alert('Error', 'Failed to capture screen');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to capture screen: ${error}`);
    }
  }, [screenName]);
}
