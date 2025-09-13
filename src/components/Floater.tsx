import {useEffect, useState} from "react";
import {Image, Linking, StyleSheet, TouchableOpacity, View,} from "react-native";
import checkForImage from "../domain/actions/checkForImage";
import useCampaigns from "../domain/actions/useCampaigns";
import {CampaignFloater} from "../domain/sdk/types";
import trackEvent from "../domain/actions/trackEvent";
import usePadding from "../domain/actions/usePadding";

export default function Floater() {
  const [imagePath, setImagePath] = useState<string | null>(null);

  const data = useCampaigns<CampaignFloater>("FLT");
  const padding = usePadding('FLT')?.bottom || 0;

  const [bottomLeftRadius, setBottomLeftRadius] = useState<number>(parseInt("0"));
  const [bottomRightRadius, setBottomRightRadius] = useState<number>(parseInt("0"));
  const [topLeftRadius, setTopLeftRadius] = useState<number>(parseInt("0"));
  const [topRightRadius, setTopRightRadius] = useState<number>(parseInt("0"));

  useEffect(() => {
    if (!data) {
      return;
    }
    // void checkForImage(data.details.image, setImagePath);
    void trackEvent("viewed", data.id)
    void checkForImage(data.details.image, (path) => {
            setImagePath(path);
    
            if (data.details.styling) {
              setBottomLeftRadius(parseInt(data.details.styling["bottomLeftRadius"] || "0"));
              setBottomRightRadius(parseInt(data.details.styling["bottomRightRadius"] || "0"));
              setTopLeftRadius(parseInt(data.details.styling["topLeftRadius"] || "0"));
              setTopRightRadius(parseInt(data.details.styling["topRightRadius"] || "0"));
            }
          });
  }, [data]);

  return (
    <>
      {data && data.details && data.details.image !== "" && (
        <View style={{
          position: "absolute",
          // top: 0,
          left: data.details.position == "left" ? 16 : undefined,
          right: data.details.position == "right" || data.details.position == "" || data.details.position == null ? (16 + (data.details.width ?? 60)) : undefined,
          bottom: 20 + padding,
          justifyContent: "flex-end",
          // marginRight: 20 + width * 0.15,
          // marginBottom: 20,
          // zIndex: 10,
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
              overflow: "hidden",
              borderBottomLeftRadius: bottomLeftRadius,
              borderBottomRightRadius: bottomRightRadius,
              borderTopLeftRadius: topLeftRadius,
              borderTopRightRadius: topRightRadius,
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
