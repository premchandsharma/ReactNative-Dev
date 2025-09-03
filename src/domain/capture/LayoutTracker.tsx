import React, {useCallback, useMemo} from "react";
import CaptureService from "./CaptureService";
import {View, ViewStyle} from "react-native";

interface LayoutTrackerProps {
  id: string;
  children: React.ReactNode;
  style?: ViewStyle;
  trackChildren?: boolean;
}

export default function LayoutTracker({id, children, style, trackChildren = false}: LayoutTrackerProps) {
  const handleLayout = useCallback((event: any) => {
    const {x, y, width, height} = event.nativeEvent.layout;
    CaptureService.addLayoutInfo(id, {x, y, width, height});
  }, [id]);

  const enhancedChildren = useMemo(() => {
    if (!trackChildren) {
      return children;
    }

    return React.Children.map(children, (child) => {
      const valid = React.isValidElement(child) && child.type === View;
      if (!valid) {
        return child;
      }

      const id = child.props.testID || child.key;
      if (!id) {
        return child;
      }

      return (
        <LayoutTracker key={id} id={id} trackChildren={true}>
          {child.props.children}
        </LayoutTracker>
      );
    });
  }, [children, trackChildren, id]);

  return (
    <View
      style={style}
      onLayout={handleLayout}
    >
      {enhancedChildren}
    </View>
  );
};
