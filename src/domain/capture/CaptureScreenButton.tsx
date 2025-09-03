import {ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import CaptureService, {useCaptureServiceStore} from "./CaptureService";
import {useCallback} from "react";

interface CaptureScreenButtonProps {
  screenName: string;
}

export default function CaptureScreenButton({screenName}: CaptureScreenButtonProps) {
  const enabled = useCaptureServiceStore(state => state.isScreenCaptureEnabled);
  const isCapturing = useCaptureServiceStore(state => state.isCapturing);

  const handleCapture = useCallback(async () => {
    try {
      if (CaptureService.getIsCapturing()) {
        Alert.alert('Info', 'Capture is already in progress');
        return;
      }

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

  if (!enabled) {
    return null;
  }

  return (
    <View style={styles.elevationContainer}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleCapture}
        style={styles.buttonContainer}
        disabled={isCapturing}
      >
        {
          isCapturing ? (
            <ActivityIndicator/>
          ) : (
            <Text style={styles.buttonText}>Capture Screen</Text>
          )
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  elevationContainer: {
    borderRadius: 12,
    elevation: 4,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  buttonText: {
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
  },
});
