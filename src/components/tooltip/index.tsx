import {Dimensions, Image, StyleSheet, TouchableOpacity, View,} from 'react-native';
import {Defs, Mask, Path, Rect, Svg} from 'react-native-svg';
import {TooltipProps} from "./types";

export default function Tooltip(
  {
    data,
    position,
    size,
    tooltipPosition,
    styling,
    onClose,
    onTooltipClick,
  }: TooltipProps
) {
  const screenSize = Dimensions.get('window');

  const renderBackdrop = () => {
    // if (!styling.enableBackdrop) return null;

    const highlightRect = {
      x: position.x - styling.highlightPadding,
      y: position.y - styling.highlightPadding,
      width: size.width + styling.highlightPadding * 2,
      height: size.height + styling.highlightPadding * 2,
    };

    return (
      <TouchableOpacity
        style={styles.backdrop}
        onPress={onClose}
        activeOpacity={1}
      >
        <Svg
          width={screenSize.width}
          height={screenSize.height}
          style={StyleSheet.absoluteFillObject}
        >
          <Defs>
            <Mask id="mask">
              <Rect
                width={screenSize.width}
                height={screenSize.height}
                fill="white"
              />
              <Rect
                x={highlightRect.x}
                y={highlightRect.y}
                width={highlightRect.width}
                height={highlightRect.height}
                rx={styling.highlightRadius}
                ry={styling.highlightRadius}
                fill="black"
              />
            </Mask>
          </Defs>
          <Rect
            width={screenSize.width}
            height={screenSize.height}
            fill="black"
            opacity={0.5}
            mask="url(#mask)"
          />
        </Svg>
      </TouchableOpacity>
    );
  };

  const renderArrow = () => {
    const arrowStyle = {
      position: 'absolute' as const,
      left: tooltipPosition.arrowX - styling.arrowWidth / 2,
      top: tooltipPosition.placement === 'bottom'
        ? position.y + size.height + styling.highlightPadding
        : position.y - styling.highlightPadding - styling.arrowHeight,
    };

    return (
      <View style={arrowStyle}>
        <Svg
          width={styling.arrowWidth}
          height={styling.arrowHeight}
        >
          <Path
            d={tooltipPosition.placement === 'top'
              ? `M0,0 L${styling.arrowWidth / 2},${styling.arrowHeight} L${styling.arrowWidth},0 Z`
              : `M0,${styling.arrowHeight} L${styling.arrowWidth / 2},0 L${styling.arrowWidth},${styling.arrowHeight} Z`
            }
            fill="white"
          />
        </Svg>
      </View>
    );
  };

  const tooltipStyle = {
    position: 'absolute' as const,
    left: tooltipPosition.tooltipX,
    top: tooltipPosition.placement === 'bottom'
      ? tooltipPosition.tooltipY
      : position.y - styling.highlightPadding - styling.arrowHeight - styling.tooltipHeight,
    width: styling.tooltipWidth,
    height: styling.tooltipHeight,
    borderRadius: styling.cornerRadius,
    backgroundColor: 'white',
    overflow: 'hidden' as const,
  };

  return (
    <View style={styles.container}>
      {renderBackdrop()}
      {renderArrow()}
      <TouchableOpacity
        style={tooltipStyle}
        onPress={onTooltipClick}
        activeOpacity={0.9}
      >
        <Image
          source={{uri: data.url}}
          style={styles.tooltipImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  tooltipImage: {
    width: '100%',
    height: '100%',
  },
});
