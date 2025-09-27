import {useEffect, useMemo, useState} from "react";
import {
  Image,
  Linking,
  Modal as RNModal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
// import LottieView from "lottie-react-native";
import useCampaigns from "../domain/actions/useCampaigns";
import {CampaignModal} from "../domain/sdk/types";
import checkForCache from "../domain/actions/checkForCache";
import trackEvent from "../domain/actions/trackEvent";

export default function Modal() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imagePath, setImagePath] = useState<string | null>(null);

  const [modalHeight, setModalHeight] = useState<number>(200);

  const data = useCampaigns<CampaignModal>("MOD");

  const modalDetails = data?.details || null;
  const modal = modalDetails?.modals?.[0];
  const imageUrl = modal?.url;

  const mediaType = useMemo(() => {
    if (!imageUrl) return "image";
    if (imageUrl.toLowerCase().endsWith(".gif")) return "gif";
    if (imageUrl.toLowerCase().endsWith(".json")) return "lottie";
    return "image";
  }, [imageUrl]);

  // Track impression when modal is shown and set initial visibility
  useEffect(() => {
    if (data?.id && modalDetails && imageUrl) {
      setIsModalVisible(true);
      void trackEvent("viewed", data.id)

      // Cache image for non-lottie media
      if (mediaType !== "lottie") {
        console.log('Checking cache for modal image:', imageUrl);
        checkForCache(imageUrl).then((result) => {
          console.log('Cache result for modal image:', result);
          if (!result) return;
          setImagePath(result.path);
          if (result.ratio) {
            setModalHeight(modalSize * result.ratio);
          }
        });
      }
    }
  }, [data?.id, modalDetails, imageUrl, mediaType]);

  // Helper function to validate URL
  const isValidUrl = (url?: string): boolean => {
    if (!url) return false;
    try {
      return url.startsWith("http://") || url.startsWith("https://");
    } catch {
      return false;
    }
  };

  // Handle modal close
  const handleCloseClick = () => {
    setIsModalVisible(false);
  };

  // Handle modal content click
  const handleModalClick = () => {
    if (data?.id) {
      void trackEvent("clicked", data.id)
    }

    const link = modal?.link;

    if (link && isValidUrl(link)) {
      // Open external URL
      Linking.openURL(link).catch(err =>
        console.error("Failed to open URL:", err)
      );
    }

    handleCloseClick();
  };

  const modalSize = parseFloat(modal?.size || "200");
  const borderRadius = parseFloat(modal?.borderRadius || "12");
  const backgroundOpacity = parseFloat(modal?.backgroundOpacity || "0.3");

  const renderMedia = () => {
    const mediaStyle = {
      width: modalSize,
      height: modalHeight,
      borderRadius: borderRadius,
    };

    switch (mediaType) {
      //   case "lottie":
      //     return (
      //       <LottieView
      //         source={{ uri: imageUrl }}
      //         autoPlay
      //         loop
      //         style={mediaStyle}
      //         resizeMode="contain"
      //       />
      //     );

      case "gif":
      case "image":
      default:
        if (!imagePath) return null;

        return (
          <Image
            source={{uri: imagePath}}
            style={[mediaStyle, styles.mediaContent]}
            resizeMode="contain"
          />
        );
    }
  };

  // Only render if we have modal data and it should be visible
  if (!modalDetails || !isModalVisible || !data || !imageUrl) {
    return null;
  }

  return (
    <RNModal
      visible={isModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCloseClick}
    >
      <TouchableWithoutFeedback onPress={handleCloseClick}>
        <View
          style={[
            styles.overlay,
            {backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity})`}
          ]}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={handleModalClick}
              style={styles.mediaContainer}
            >
              {renderMedia()}
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity
              onPress={handleCloseClick}
              style={styles.closeButton}
              activeOpacity={1}
            >
              <Image
                source={require("../assets/images/close.png")}
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    position: "relative",
    padding: 8,
  },
  mediaContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  mediaContent: {
    // Additional styling for images if needed
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    width: 10,
    height: 10,
    tintColor: "white",
  },
});
