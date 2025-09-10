import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import useCampaigns from "../domain/actions/useCampaigns";
import { CampaignWidgets } from "../domain/sdk/types";
import trackEvent from "../domain/actions/trackEvent";

interface WidgetImage {
  id: string;
  image: string;
  link: string;
  order: number;
}

interface WidgetsProps {
  leftPadding?: number;
  rightPadding?: number;
}

export default function Widgets({ leftPadding = 0, rightPadding = 0 }: WidgetsProps) {
  const flatlistRef = useRef<FlatList<WidgetImage> | null>(null);
  const screenWidth = Dimensions.get("window").width;
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [widgetHeight, setWidgetHeight] = useState<number>(100);

  const [bottomLeftRadius, setBottomLeftRadius] = useState<number>(parseInt("0"));
  const [bottomRightRadius, setBottomRightRadius] = useState<number>(parseInt("0"));
  const [topLeftRadius, setTopLeftRadius] = useState<number>(parseInt("0"));
  const [topRightRadius, setTopRightRadius] = useState<number>(parseInt("0"));
  const [bottomMargin, setBottomMargin] = useState<number>(parseInt("0"));
  const [topMargin, setTopMargin] = useState<number>(parseInt("0"));
  const [leftMargin, setLeftMargin] = useState<number>(parseInt("0"));
  const [rightMargin, setRightMargin] = useState<number>(parseInt("0"));

  const data = useCampaigns<CampaignWidgets>("WID");

  // Calculate the actual content width considering margins
  const contentWidth = screenWidth - leftMargin - rightMargin - leftPadding - rightPadding;

  const extendedImages = useMemo(() => {
    if (!data?.details?.widget_images) return [];

    Image.getSize(
      data.details.widget_images[0].image,
      (imgWidth, imgHeight) => {
        const aspectRatio = imgHeight / imgWidth;
        setWidgetHeight(contentWidth * aspectRatio);
      },
      (error) => {
        console.error("Failed to get image size:", error);
      }
    );

    if (data.details.styling) {
      setBottomLeftRadius(parseInt(data.details.styling["bottomLeftRadius"] || "0"));
      setBottomRightRadius(parseInt(data.details.styling["bottomRightRadius"] || "0"));
      setTopLeftRadius(parseInt(data.details.styling["topLeftRadius"] || "0"));
      setTopRightRadius(parseInt(data.details.styling["topRightRadius"] || "0"));
      setBottomMargin(parseInt(data.details.styling["bottomMargin"] || "0"));
      setTopMargin(parseInt(data.details.styling["topMargin"] || "0"));
      setLeftMargin(parseInt(data.details.styling["leftMargin"] || "0"));
      setRightMargin(parseInt(data.details.styling["rightMargin"] || "0"));
    }

    // return data.details.type === "full"
    //   ? [
    //     data.details.widget_images[data.details.widget_images.length - 1],
    //     ...data.details.widget_images,
    //     data.details.widget_images[0],
    //   ].filter((item): item is WidgetImage => item !== undefined)
    //   : data.details.widget_images.filter((item): item is WidgetImage => item !== undefined);

    return data.details.widget_images.filter((item): item is WidgetImage => item !== undefined);

  }, [data, contentWidth]);

  const scrollToNextImage = () => {
    if (!data) return;

    if (!flatlistRef.current || !extendedImages.length || data.details.type !== "full") return;

    // if (activeIndex === data.details.widget_images.length - 1) {
    //   flatlistRef.current.scrollToOffset({
    //     offset: contentWidth,
    //     animated: false
    //   });
    //   setTimeout(() => {
    //     scrollToNextImage();
    //   }, 50);
    // } else {
    //   flatlistRef.current.scrollToOffset({
    //     offset: contentWidth * (activeIndex + 2),
    //     animated: true
    //   });
    // }

    if (activeIndex === data.details.widget_images.length - 1) {
      // Clear the interval to stop auto-scrolling
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Continue to next image
    flatlistRef.current.scrollToOffset({
      offset: contentWidth * (activeIndex + 1),
      animated: true
    });
  };

  useEffect(() => {
    // Only start auto-scroll if we're not on the last image
    if (data?.details.type === "full" && activeIndex < data.details.widget_images.length - 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(scrollToNextImage, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeIndex, data, extendedImages.length]);

  const getItemLayout = (
    data: ArrayLike<WidgetImage> | null | undefined,
    index: number
  ) => ({
    data: data,
    length: contentWidth,
    offset: contentWidth * index,
    index: index,
  });

  const trackedImpressionsRef = useRef<string[]>([]);

  const trackImpression = (widget_image_id: string) => {
    if (data && !trackedImpressionsRef.current.includes(widget_image_id)) {
      console.log(`Tracking impression for: ${widget_image_id}`);
      trackedImpressionsRef.current.push(widget_image_id);
      void trackEvent("viewed", data.id, { "widget_image": widget_image_id })
    } else {
      console.log(`Impression already tracked for: ${widget_image_id}`);
    }
  };

  const handleViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: { item: WidgetImage }[];
  }) => {
    viewableItems.forEach(({ item }) => {
      trackImpression(item.id);
    });
  };

  const renderFullWidthItem = ({ item, index }: { item: WidgetImage; index: number }) => {
    return (
      <View
        key={`${item.order}-${index}`}
        style={{
          width: contentWidth,
          marginHorizontal: 0,
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            if (data && item.link) {
              void trackEvent("clicked", data.id, { "widget_image": item.id })
              void Linking.openURL(item.link);
            }
          }}
        >
          <Image
            source={{ uri: item.image }}
            style={{
              borderTopRightRadius: topRightRadius,
              borderTopLeftRadius: topLeftRadius,
              borderBottomRightRadius: bottomRightRadius,
              borderBottomLeftRadius: bottomLeftRadius,
              height: widgetHeight,
              width: contentWidth,
              resizeMode: 'cover',
            }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderHalfWidthItem = ({ item, index }: { item: WidgetImage; index: number }) => {
    const halfItemWidth = contentWidth * 0.455;
    const halfItemMargin = contentWidth * 0.03;

    return (
      <View
        key={`${item.order}-${index}`}
        style={{
          width: halfItemWidth,
          marginLeft: halfItemMargin,
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            if (data && item.link) {
              void trackEvent("clicked", data.id, { "widget_image": item.id })
              void Linking.openURL(item.link);
            }
          }}
        >
          <Image
            source={{ uri: item.image }}
            style={{
              borderTopRightRadius: topRightRadius,
              borderTopLeftRadius: topLeftRadius,
              borderBottomRightRadius: bottomRightRadius,
              borderBottomLeftRadius: bottomLeftRadius,
              height: (widgetHeight / 2) - (contentWidth * 0.045),
              width: halfItemWidth,
              resizeMode: 'cover',
            }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (data && data.details.type !== "full") return;

    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / contentWidth);

    // Update active index directly without infinite loop logic
    setActiveIndex(index);

    // Restart auto-scroll timer if we're not on the last image
    if (index < data!.details.widget_images.length - 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(scrollToNextImage, 5000);
      }
    } else {
      // Clear interval when we reach the last image
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const renderDotIndicators = () => {
    return data?.details.widget_images.map((dot, index) => {
      console.log(dot);
      return (
        <View
          key={index}
          style={{
            backgroundColor: activeIndex === index ? "black" : "grey",
            height: 6,
            width: activeIndex === index ? 12 : 6,
            borderRadius: 5,
            marginHorizontal: 3,
            marginVertical: 6,
          }}
        />
      );
    });
  };

  if (!data || !data.details.widget_images) return null;

  return (
    <View style={{
      width: '100%',
      backgroundColor: 'transparent',
      marginTop: topMargin,
      marginBottom: bottomMargin,
      paddingLeft: leftMargin,
      paddingRight: rightMargin,
    }}>
      <FlatList
        data={extendedImages}
        ref={flatlistRef}
        getItemLayout={data.details.type === "full" ? getItemLayout : undefined}
        renderItem={data.details.type === "full" ? renderFullWidthItem : renderHalfWidthItem}
        keyExtractor={(item, index) => `${item.image}-${index}`}
        horizontal={true}
        pagingEnabled={data.details.type === "full"}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          viewAreaCoveragePercentThreshold: 50,
        }}
        onScroll={data.details.type === "full" ? handleScroll : undefined}
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={data.details.type === "full" ? 0 : undefined}
        onLayout={() => {
          if (data.details.type === "full") {
            flatlistRef.current?.scrollToOffset({
              offset: 0,
              animated: false
            });
          }
        }}
        scrollEnabled={data.details.type === "full"}
        contentContainerStyle={{
          paddingRight: data.details.type === "half" ? contentWidth * 0.03 : 0,
        }}
      />

      {data.details.type === "full" && (
        <View style={{
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "center",
        }}>
          {renderDotIndicators()}
        </View>
      )}
    </View>
  );
};