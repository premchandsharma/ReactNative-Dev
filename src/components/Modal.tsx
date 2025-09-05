import { useEffect, useMemo, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Modal as RNModal,
  StyleSheet,
  TouchableWithoutFeedback,
  Linking,
} from "react-native";
import RNFS from "react-native-fs";
// import LottieView from "lottie-react-native";
import useCampaigns from "../domain/actions/useCampaigns";
import { CampaignModal } from "../domain/sdk/types";

export default function Modal() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imagePath, setImagePath] = useState<string | null>(null);
//   const { width, height } = Dimensions.get("window");

  // Find modal campaign data
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

  const downloadImage = async (url: string) => {
    const filename = url.split("/").pop()?.split("?")[0];
    try {
      const downloadResult = await RNFS.downloadFile({
        fromUrl: url,
        toFile: `${RNFS.DocumentDirectoryPath}/${filename}`,
      }).promise;
      if (downloadResult.statusCode === 200) {
        console.log("Image downloaded!");
      } else {
        console.error("Failed to download image:", downloadResult);
      }
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const checkCacheForImage = async (url: string) => {
    const filename = url.split("/").pop()?.split("?")[0];
    const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
    try {
      const exists = await RNFS.exists(path);
      if (exists) {
        setImagePath(path);
      } else {
        await downloadImage(url);
        setImagePath(path);
      }
    } catch (error) {
      console.error("Error checking cache for image:", error);
      // Fallback to direct URL if caching fails
      setImagePath(url);
    }
  };

  // Track impression when modal is shown and set initial visibility
  useEffect(() => {
    if (data?.id && modalDetails && imageUrl) {
      setIsModalVisible(true);
    //   UserActionTrack(user_id, campaignData.id, "IMP");
      
      // Cache image for non-lottie media
      if (mediaType !== "lottie") {
        checkCacheForImage(imageUrl);
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
    //   UserActionTrack(user_id, campaignData.id, "CLK");
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
      height: modalSize,
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
        
        const imageSource = imagePath?.startsWith("file://") 
          ? { uri: imagePath }
          : imagePath?.startsWith("http") 
            ? { uri: imagePath }
            : { uri: `file://${imagePath}` };

        return (
          <Image
            source={imageSource}
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
            { backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity})` }
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