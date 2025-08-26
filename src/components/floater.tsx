import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { UserActionTrack } from "../utils/trackuseraction"; // Import the tracking function
import { CampaignFloater, UserData } from "../sdk";
import RNFS from "react-native-fs";

export type FloaterProps = {
} & UserData;

const Floater: React.FC<FloaterProps> = ({
  campaigns,
  user_id,
}) => {
  // const { width } = Dimensions.get("window");

  const data = campaigns.find(
    (val) => val.campaign_type === "FLT",
  ) as CampaignFloater;

  const [imagePath, setImagePath] = React.useState<string | null>(null);

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
    }
  };

  useEffect(() => {
    if (!data) {
      return;
    }
    checkCacheForImage(data.details.image);
    const trackImpression = async () => {
      try {
        await UserActionTrack(user_id, data.id, "IMP");
      } catch (error) {
        console.error("Error in tracking impression:", error);
      }
    };

    trackImpression();
  }, [data, user_id]);

  return (
    <>
      {data && data.details && data.details.image !== "" && (
        <View style={{
          position: "absolute",
          // top: 0,
          left: data.details.position == "left" ? 16 : undefined,
          right: data.details.position == "right" || data.details.position == "" || data.details.position == null ? (16 + (data.details.width ?? 60)) : undefined,
          bottom: 20,
          justifyContent: "flex-end",
          // marginRight: 20 + width * 0.15,
          // marginBottom: 20,
          zIndex: 10,
        }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              
              if (data.details.link) {
                UserActionTrack(user_id, data.id, "CLK");
                Linking.openURL(data.details.link);
              }
            }}
            style={{
              width: data.details.width ?? 60,
              height: data.details.height ?? 60,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              position: "absolute",
              // right: 20,
              // bottom: 20,
              overflow: "hidden",
              borderRadius: 100,
            }}
          >
            <Image
              source={{ uri: `file://${imagePath}` }}
              style={styles.image}
            />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});

export default Floater;
