import React, {useEffect} from "react";
import {Image, Linking, StyleSheet, TouchableOpacity, View,} from "react-native";
import checkForImage from "../domain/actions/checkForImage";
import useCampaigns from "../domain/actions/useCampaigns";
import {CampaignFloater} from "../domain/sdk/types";
import trackEvent from "../domain/actions/trackEvent";

export default function Floater() {
  const [imagePath, setImagePath] = React.useState<string | null>(null);

  const data = useCampaigns<CampaignFloater>("FLT");

  useEffect(() => {
    if (!data) {
      return;
    }
    void checkForImage(data.details.image, setImagePath);
    void trackEvent("viewed", data.id)
  }, [data]);

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
                void trackEvent("clicked", data.id)
                void Linking.openURL(data.details.link);
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
              source={{uri: `file://${imagePath}`}}
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
