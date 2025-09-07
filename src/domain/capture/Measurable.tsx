import React, { useContext, useEffect, useRef } from 'react';
import { View } from 'react-native';
import MeasurementContext from './MeasurementContext';

interface MeasurableProps {
  appstorys: string;
  children: React.ReactNode;
}

export default function Measurable({ appstorys, children }: MeasurableProps) {
  // Get the register/unregister functions from our context
  const { register, unregister } = useContext(MeasurementContext);
  const componentRef = useRef(null);

  useEffect(() => {
    // When the component is added to the screen, register it.
    if (appstorys && componentRef.current) {
      register(appstorys, componentRef.current);
    }

    // When the component is removed, unregister it.
    return () => {
      if (appstorys) {
        unregister(appstorys);
      }
    };
  }, [appstorys, register, unregister]);

  // We render a View and pass the ref to it.
  // The children are placed inside this measurable View.


  // Note: The `collapsable={false}` prop is important. It ensures that this
  // View doesn't get optimized away by the React Native layout system,
  // which would prevent us from measuring it accurately.
  return (
    <View ref={componentRef} collapsable={false}>
      {children}
    </View>
  );
};
