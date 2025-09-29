import {useEffect, useRef, useState} from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Linking,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useCampaigns from "../domain/actions/useCampaigns";
import {CampaignBottomSheet} from "../domain/sdk/types";
import checkForCache from "../domain/actions/checkForCache";
import trackEvent from "../domain/actions/trackEvent";

const {height: SCREEN_HEIGHT} = Dimensions.get("window");
const DRAG_THRESHOLD = 50;

export default function BottomSheet() {
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});

  // Animation values
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [isContentMeasured, setIsContentMeasured] = useState(false);

  // Find bottom sheet campaign data
  const campaignData = useCampaigns<CampaignBottomSheet>("BTS");

  const bottomSheetDetails = campaignData?.details || null;
  const elements = bottomSheetDetails?.elements?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

  const imageElement = elements.find(el => el.type === "image");
  const bodyElements = elements.filter(el => el.type === "body");
  const ctaElements = elements.filter(el => el.type === "cta");

  // Pan responder for gesture handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(Math.max(0, gestureState.dy));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DRAG_THRESHOLD || gestureState.vy > 0.5) {
          handleDismissRequest();
        } else {
          // Snap back to original position
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  // Show bottom sheet with animation
  const showBottomSheet = () => {
    setIsBottomSheetVisible(true);

    // Reset animation values
    slideAnim.setValue(SCREEN_HEIGHT);
    backdropOpacity.setValue(0);

    // Start animations
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();
  };

  // Hide bottom sheet with animation
  const hideBottomSheet = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.quad),
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.quad),
      }),
    ]).start(() => {
      setIsBottomSheetVisible(false);
      setIsContentMeasured(false);
    });
  };

  // Track impression and show bottom sheet
  useEffect(() => {
    if (campaignData?.id && bottomSheetDetails) {
      void trackEvent("viewed", campaignData.id)

      // Cache image if exists
      if (imageElement?.url) {
        checkForCache(imageElement.url).then((result) => {
          if (result?.path) {
            setImageCache(prev => ({...prev, [imageElement.url!]: result.path}));
          }
        });
      }

      // Show bottom sheet after a brief delay
      setTimeout(showBottomSheet, 100);
    }
  }, [campaignData?.id, bottomSheetDetails, imageElement?.url]);

  // Helper function to validate URL
  const isValidUrl = (url?: string): boolean => {
    if (!url) return false;
    try {
      return url.startsWith("http://") || url.startsWith("https://");
    } catch {
      return false;
    }
  };

  // Handle dismiss
  const handleDismissRequest = () => {
    hideBottomSheet();
  };

  // Handle backdrop press
  const handleBackdropPress = () => {
    handleDismissRequest();
  };

  // Handle CTA click
  const handleClick = (ctaLink?: string) => {
    if (ctaLink && campaignData?.id) {
      void trackEvent("clicked", campaignData.id)

      if (isValidUrl(ctaLink)) {
        Linking.openURL(ctaLink).catch(err =>
          console.error("Failed to open URL:", err)
        );
      }
    }
  };

  // Parse color string to valid color
  const parseColor = (colorStr?: string, defaultColor: string = "#000000"): string => {
    if (!colorStr) return defaultColor;
    try {
      // Handle hex colors
      if (colorStr.startsWith("#")) {
        return colorStr;
      }
      // Handle other color formats if needed
      return colorStr.startsWith("#") ? colorStr : `#${colorStr}`;
    } catch {
      return defaultColor;
    }
  };

  // Get text alignment
  const getTextAlign = (alignment?: string): "left" | "center" | "right" => {
    switch (alignment) {
      case "left":
        return "left";
      case "right":
        return "right";
      default:
        return "center";
    }
  };

  // Get justify content for alignment
  const getJustifyContent = (alignment?: string) => {
    switch (alignment) {
      case "left":
        return "flex-start";
      case "right":
        return "flex-end";
      default:
        return "center";
    }
  };

  // Render Image Element
  const renderImageElement = (element: any) => {
    const cachedPath = imageCache[element.url];
    if (!cachedPath) return null;

    return (
      <TouchableOpacity
        key={`image-${element.order}`}
        onPress={() => handleClick(element.imageLink)}
        activeOpacity={1}
        style={[
          styles.imageContainer,
          {
            paddingLeft: parseFloat(element.paddingLeft || "0"),
            paddingRight: parseFloat(element.paddingRight || "0"),
            paddingTop: parseFloat(element.paddingTop || "0"),
            paddingBottom: parseFloat(element.paddingBottom || "0"),
            justifyContent: getJustifyContent(element.alignment),
          }
        ]}
      >
        <Image
          source={{uri: cachedPath}}
          style={styles.image}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  // Render Body Element
  const renderBodyElement = (element: any) => {
    const titleFontSize = parseFloat(element.titleFontSize || "16");
    const descriptionFontSize = parseFloat(element.descriptionFontSize || "14");
    const spacing = parseFloat(element.spacingBetweenTitleDesc || "8");

    const titleColor = parseColor(element.titleFontStyle?.colour, "#000000");
    const descriptionColor = parseColor(element.descriptionFontStyle?.colour, "#000000");
    const backgroundColor = parseColor(element.bodyBackgroundColor, "#FFFFFF");

    const titleDecoration = element.titleFontStyle?.decoration || "";
    const descriptionDecoration = element.descriptionFontStyle?.decoration || "";

    return (
      <View
        key={`body-${element.order}`}
        style={[
          styles.bodyContainer,
          {
            backgroundColor,
            paddingLeft: parseFloat(element.paddingLeft || "0"),
            paddingRight: parseFloat(element.paddingRight || "0"),
            paddingTop: parseFloat(element.paddingTop || "0"),
            paddingBottom: parseFloat(element.paddingBottom || "0"),
            alignItems: element.alignment === "left" ? "flex-start" :
              element.alignment === "right" ? "flex-end" : "center",
          }
        ]}
      >
        {element.titleText && (
          <Text
            style={[
              styles.titleText,
              {
                color: titleColor,
                fontSize: titleFontSize,
                textAlign: getTextAlign(element.alignment),
                fontWeight: titleDecoration.includes("bold") ? "bold" : "normal",
                fontStyle: titleDecoration.includes("italic") ? "italic" : "normal",
                textDecorationLine: titleDecoration.includes("underline") ? "underline" : "none",
                lineHeight: (parseFloat(element.titleLineHeight || "1") * titleFontSize),
              }
            ]}
          >
            {element.titleText}
          </Text>
        )}

        {element.titleText && element.descriptionText && (
          <View style={{height: spacing}}/>
        )}

        {element.descriptionText && (
          <Text
            style={[
              styles.descriptionText,
              {
                color: descriptionColor,
                fontSize: descriptionFontSize,
                textAlign: getTextAlign(element.alignment),
                fontWeight: descriptionDecoration.includes("bold") ? "bold" : "normal",
                fontStyle: descriptionDecoration.includes("italic") ? "italic" : "normal",
                textDecorationLine: descriptionDecoration.includes("underline") ? "underline" : "none",
                lineHeight: (parseFloat(element.descriptionLineHeight || "1") * descriptionFontSize),
              }
            ]}
          >
            {element.descriptionText}
          </Text>
        )}
      </View>
    );
  };

  // Render CTA Element
  const renderCTAElement = (element: any) => {
    const buttonColor = parseColor(element.ctaBoxColor, "#000000");
    const textColor = parseColor(element.ctaTextColour, "#FFFFFF");
    const backgroundColor = parseColor(element.ctaBackgroundColor, "#FFFFFF");
    const borderRadius = parseFloat(element.ctaBorderRadius || "5");
    const buttonHeight = parseFloat(element.ctaHeight || "50");
    const buttonWidth = parseFloat(element.ctaWidth || "100");
    const fontSize = parseFloat(element.ctaFontSize || "14");

    const decoration = element.ctaFontDecoration || "";

    return (
      <View
        key={`cta-${element.order}`}
        style={[
          styles.ctaContainer,
          {
            backgroundColor,
            paddingLeft: parseFloat(element.paddingLeft || "0"),
            paddingRight: parseFloat(element.paddingRight || "0"),
            paddingTop: parseFloat(element.paddingTop || "0"),
            paddingBottom: parseFloat(element.paddingBottom || "0"),
            justifyContent: getJustifyContent(element.alignment),
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => handleClick(element.ctaLink)}
          activeOpacity={1}
          style={[
            styles.ctaButton,
            {
              backgroundColor: buttonColor,
              borderRadius,
              height: buttonHeight,
              width: element.ctaFullWidth ? "100%" : buttonWidth,
            }
          ]}
        >
          <Text
            style={[
              styles.ctaText,
              {
                color: textColor,
                fontSize,
                fontWeight: decoration.includes("bold") ? "bold" : "normal",
                fontStyle: decoration.includes("italic") ? "italic" : "normal",
                textDecorationLine: decoration.includes("underline") ? "underline" : "none",
              }
            ]}
          >
            {element.ctaText || "Click"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render CTA Row (for left/right positioned CTAs)
  const renderCTARow = () => {
    const leftCTA = ctaElements.find(el => el.position === "left");
    const rightCTA = ctaElements.find(el => el.position === "right");

    if (!leftCTA && !rightCTA) return null;

    return (
      <View key="cta-row" style={styles.ctaRow}>
        <View style={styles.ctaRowItem}>
          {leftCTA && renderCTAElement(leftCTA)}
        </View>
        <View style={styles.ctaRowItem}>
          {rightCTA && renderCTAElement(rightCTA)}
        </View>
      </View>
    );
  };

  // Only render if we have bottom sheet data and it should be visible
  if (!bottomSheetDetails || !campaignData) {
    return null;
  }

  const cornerRadius = parseFloat(bottomSheetDetails.cornerRadius || "16");
  const hasOverlayButton = imageElement?.overlayButton === true;
  const centerCTAs = ctaElements.filter(el => el.position === "center" || !el.position);

  return (
    <Modal
      visible={isBottomSheetVisible}
      transparent={true}
      animationType="none"
      onRequestClose={handleDismissRequest}
    >
      <View style={styles.overlay}>
        {/* Animated Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity
            }
          ]}
        >
          <TouchableOpacity
            style={styles.backdropTouchable}
            onPress={handleBackdropPress}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Animated Bottom Sheet */}
        <Animated.View
          style={[
            styles.bottomSheetContainer,
            {
              borderTopLeftRadius: cornerRadius,
              borderTopRightRadius: cornerRadius,
              transform: [{translateY: slideAnim}]
            }
          ]}
          {...panResponder.panHandlers}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            bounces={false}
            onContentSizeChange={(_, contentHeight) => {
              if (!isContentMeasured && contentHeight > 0) {
                setIsContentMeasured(true);
              }
            }}
          >
            {hasOverlayButton ? (
              <View style={styles.overlayContainer}>
                {imageElement && renderImageElement(imageElement)}

                <View style={styles.overlayContent}>
                  {bodyElements.map(renderBodyElement)}
                  {renderCTARow()}
                  {centerCTAs.map(renderCTAElement)}
                </View>
              </View>
            ) : (
              <View style={styles.normalContainer}>
                {imageElement && renderImageElement(imageElement)}
                {bodyElements.map(renderBodyElement)}
                {renderCTARow()}
                {centerCTAs.map(renderCTAElement)}
              </View>
            )}
          </ScrollView>

          {/* Close Button */}
          {bottomSheetDetails.enableCrossButton === "true" && (
            <TouchableOpacity
              onPress={handleDismissRequest}
              style={styles.closeButton}
            >
              <Image
                source={require("../assets/images/close.png")}
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdropTouchable: {
    flex: 1,
  },
  bottomSheetContainer: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,

    overflow: "hidden",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  scrollView: {
    flexGrow: 0,
    flexShrink: 1,
  },
  overlayContainer: {
    position: "relative",
  },
  overlayContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  normalContainer: {
    backgroundColor: "white",
  },
  imageContainer: {
    backgroundColor: "transparent",
    width: "100%",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: undefined,
    aspectRatio: 1,
  },
  bodyContainer: {
    width: "100%",
  },
  titleText: {
    width: "100%",
  },
  descriptionText: {
    width: "100%",
  },
  ctaContainer: {
    width: "100%",
    alignItems: "center",
  },
  ctaRow: {
    flexDirection: "row",
    width: "100%",
  },
  ctaRowItem: {
    flex: 1,
  },
  ctaButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  ctaText: {
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  closeIcon: {
    width: 12,
    height: 12,
    tintColor: "white",
  },
});
