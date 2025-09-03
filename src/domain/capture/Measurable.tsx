import React, {useContext, useEffect, useRef} from 'react';
import {View} from 'react-native';
import MeasurementContext from './MeasurementContext';

interface MeasurableProps {
  testID: string;
  children: React.ReactNode;
}

export default function Measurable({testID, children}: MeasurableProps) {
  // Get the register/unregister functions from our context
  const {register, unregister} = useContext(MeasurementContext);
  const componentRef = useRef(null);

  useEffect(() => {
    // When the component is added to the screen, register it.
    if (testID && componentRef.current) {
      register(testID, componentRef.current);
    }

    // When the component is removed, unregister it.
    return () => {
      if (testID) {
        unregister(testID);
      }
    };
  }, [testID, register, unregister]);

  // We render a View and pass the ref to it.
  // The children are placed inside this measurable View.
  return (
    <View ref={componentRef} collapsable={false} testID={testID}>
      {children}
    </View>
  );
};

// Note: The `collapsable={false}` prop is important. It ensures that this
// View doesn't get optimized away by the React Native layout system,
// which would prevent us from measuring it accurately.
