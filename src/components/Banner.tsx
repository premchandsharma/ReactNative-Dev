import {useCallback, useEffect, useState} from "react";

import {Dimensions, Image, Linking, StyleSheet, TouchableOpacity, View} from "react-native";
import {CampaignBanner} from "../domain/sdk/types";
import trackUserAction from "../domain/actions/trackUserAction";
import checkForImage from "../domain/actions/checkForImage";
import useCampaigns from "../domain/actions/useCampaigns";

export default function Banner() {
  const {width} = Dimensions.get("window");

  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [imagePath, setImagePath] = useState<string | null>(null);

  const data = useCampaigns<CampaignBanner>("BAN");

  const closeBanner = useCallback(() => {
    setIsBannerVisible(false);
    // UserActionTrack(user_id, data.id, 'CLK');
  }, []);

  useEffect(() => {
    if (data && data.id) {
      void trackUserAction(data.id, "IMP");
      void checkForImage(data.details.image, setImagePath);
    }
  }, [data]);

  return (
    <>
      {data && data.details && data.details.image !== "" && isBannerVisible && (
        <View style={styles.container}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              void trackUserAction(data.id, "CLK");
              if (data.details.link) {
                void Linking.openURL(data.details.link);
              }
            }}
            style={[
              styles.banner,
              {width: width - 20, height: data.details.height ?? 92, borderRadius: 6,},
            ]}
          >
            <View style={[styles.banner, {borderRadius: 6,}]}>
              <Image
                source={{uri: `file://${imagePath}`}}
                style={{width: width - 20, height: data.details.height ?? 92, borderRadius: 6,}}
              />
            </View>
            <TouchableOpacity onPress={closeBanner} style={styles.closeButton} activeOpacity={1}>
              <Image
                source={require("../assets/images/close.png")}
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    // top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 12,
    zIndex: 10,  // Ensure the banner is on top

  },
  banner: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 1)",
    position: "relative",
    // bottom: 16,
    overflow: "visible",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  closeButton: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "black",
    borderRadius: 15,
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    height: 8,
    width: 8,
  },
});
