# AppStorys React Native - Measurement System

## Overview

The measurement system automatically captures the layout information of UI elements with `testID` props when taking
screenshots. This is essential for creating interactive overlays and annotations on captured screens.

## Setup

### 1. Install and Configure Babel Plugin

Add the babel plugin to your `babel.config.js`:

```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'node_modules/@appstorys/react-native/babel-plugin.js'
  ],
};
```

### 2. Wrap Your App with MeasurementProvider

```jsx
import React from 'react';
import {MeasurementProvider} from '@appstorys/react-native';
import YourMainApp from './YourMainApp';

export default function App() {
  return (
    <MeasurementProvider>
      <YourMainApp/>
    </MeasurementProvider>
  );
}
```

## Usage

### Automatic Element Wrapping

Simply add `testID` props to any elements you want to measure. The Babel plugin will automatically wrap them:

```jsx
// Before (what you write):
<View testID="my-container" style={styles.container}>
  <Text testID="my-text">Hello World</Text>
</View>

// After (what the Babel plugin generates):
<Measurable testID="my-container">
  <View style={styles.container}>
    <Measurable testID="my-text">
      <Text>Hello World</Text>
    </Measurable>
  </View>
</Measurable>
```

### Taking Screenshots with Layout Data

Use the `useMeasurement` hook to capture screens with layout information:

```jsx
import React from 'react';
import {View, Text, Button} from 'react-native';
import {useMeasurement} from '@appstorys/react-native';

const MyScreen = () => {
  const {measureAndCapture} = useMeasurement();

  const handleCapture = async () => {
    try {
      const success = await measureAndCapture('my-screen');
      console.log('Screenshot captured with layout data:', success);
    } catch (error) {
      console.error('Failed to capture screen:', error);
    }
  };

  return (
    <View>
      <Text testID="title">My Screen Title</Text>
      <Button testID="action-button" title="Capture Screen" onPress={handleCapture}/>
    </View>
  );
};
```

## API Reference

### MeasurementProvider

Wrap your app with this provider to enable the measurement system.

**Props:**

- `children: React.ReactNode` - Your app components

### Measurable

Wrapper component that registers elements for measurement. Usually added automatically by the Babel plugin.

**Props:**

- `testID: string` - Unique identifier for the element
- `children: React.ReactNode` - The element to wrap

## Best Practices

1. **Use Meaningful testIDs**: Use descriptive testIDs that help identify the purpose of each element
2. **Avoid Nested Measurable**: The Babel plugin prevents double-wrapping, but avoid manually adding Measurable around
   elements that already have testIDs
3. **Provider Placement**: Place MeasurementProvider as high as possible in your component tree
4. **Performance**: The system is optimized to prevent unnecessary re-renders during registration

## Migration from LayoutTracker

If you were using the old `LayoutTracker` component:

1. Remove all `LayoutTracker` components from your code
2. Add `testID` props to the elements you want to measure
3. Wrap your app with `MeasurementProvider`
4. Use `useMeasurement` instead of calling `CaptureService` directly

The new system is more performant and automatic!
