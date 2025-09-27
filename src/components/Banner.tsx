import {useCallback, useEffect, useState} from "react";

import {Dimensions, Image, Linking, StyleSheet, TouchableOpacity, View} from "react-native";
import {CampaignBanner} from "../domain/sdk/types";
import checkForCache from "../domain/actions/checkForCache";
import useCampaigns from "../domain/actions/useCampaigns";
import trackEvent from "../domain/actions/trackEvent";
import usePadding from "../domain/actions/usePadding";

export default function Banner() {
  const {width} = Dimensions.get("window");

  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [bannerHeight, setBannerHeight] = useState<number>(100);

  const [bottomLeftRadius, setBottomLeftRadius] = useState<number>(parseInt("0"));
  const [bottomRightRadius, setBottomRightRadius] = useState<number>(parseInt("0"));
  const [topLeftRadius, setTopLeftRadius] = useState<number>(parseInt("0"));
  const [topRightRadius, setTopRightRadius] = useState<number>(parseInt("0"));

  const [marginBottom, setMarginBottom] = useState<number>(parseInt("0"));
  const [marginLeft, setMarginLeft] = useState<number>(parseInt("0"));
  const [marginRight, setMarginRight] = useState<number>(parseInt("0"));

  const [enableCloseButton, setEnableCloseButton] = useState<boolean>(false);

  const data = useCampaigns<CampaignBanner>("BAN");
  const padding = usePadding('BAN')?.bottom || 0;

  const closeBanner = useCallback(() => {
    setIsBannerVisible(false);
  }, []);

  useEffect(() => {
    if (data && data.id) {
      void trackEvent("viewed", data.id);
      checkForCache(data.details.image).then((result) => {
        if (!result) return;

        setImagePath(result.path);

        if (data.details.styling) {
          setBottomLeftRadius(parseInt(data.details.styling["bottomLeftRadius"] || "0"));
          setBottomRightRadius(parseInt(data.details.styling["bottomRightRadius"] || "0"));
          setTopLeftRadius(parseInt(data.details.styling["topLeftRadius"] || "0"));
          setTopRightRadius(parseInt(data.details.styling["topRightRadius"] || "0"));
          setMarginBottom(parseInt(data.details.styling["marginBottom"] || "0"));
          setMarginLeft(parseInt(data.details.styling["marginLeft"] || "0"));
          setMarginRight(parseInt(data.details.styling["marginRight"] || "0"));
          setEnableCloseButton(Boolean(data.details.styling["enableCloseButton"]));
        }

        const bannerWidth = width - (marginLeft + marginRight);
        if (result.ratio) {
          setBannerHeight(bannerWidth * result.ratio);
        }
      });
    }
  }, [data, width]);

  const bannerWidth = width - marginLeft - marginRight;

  return (
    <>
      {data && data.details && data.details.image !== "" && isBannerVisible && (
        <View style={{
          position: "absolute",
          left: marginLeft,
          right: marginRight,
          bottom: marginBottom + padding,
          alignItems: "center",
          justifyContent: "flex-end",
        }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              if (data.details.link) {
                void trackEvent("clicked", data.id)
                void Linking.openURL(data.details.link);
              }
            }}
            style={[
              styles.banner,
              {
                width: bannerWidth,
                height: bannerHeight,
                borderTopRightRadius: topRightRadius,
                borderTopLeftRadius: topLeftRadius,
                borderBottomRightRadius: bottomRightRadius,
                borderBottomLeftRadius: bottomLeftRadius,
                backgroundColor: "transparent",
                overflow: "hidden",
              },
            ]}
          >
            {imagePath &&
              <Image
                source={{uri: imagePath}}
                style={{
                  width: bannerWidth,
                  height: bannerHeight,
                  resizeMode: "cover",
                  borderTopRightRadius: topRightRadius,
                  borderTopLeftRadius: topLeftRadius,
                  borderBottomRightRadius: bottomRightRadius,
                  borderBottomLeftRadius: bottomLeftRadius,
                }}
              />
            }
            {enableCloseButton && (
              <TouchableOpacity
                onPress={closeBanner}
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6, // Fixed: removed marginRight from here
                  backgroundColor: "rgba(0, 0, 0, 1)", // Semi-transparent background for better visibility
                  borderRadius: 15,
                  padding: 6,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                activeOpacity={1}
              >
                <Image
                  source={require("../assets/images/close.png")}
                  style={styles.closeIcon}
                />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  banner: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  closeIcon: {
    height: 8,
    width: 8,
    tintColor: "white",
  },
});
