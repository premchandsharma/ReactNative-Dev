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
import {useEffect, useMemo, useRef, useState} from "react";
import useCampaigns from "../domain/actions/useCampaigns";
import {CampaignWidgets} from "../domain/sdk/types";
import trackEvent from "../domain/actions/trackEvent";
import checkForImage from "../domain/actions/checkForImage";

interface WidgetImage {
  id: string;
  image: string;
  link: string;
  order: number;
}

interface CachedWidgetImage extends WidgetImage {
  cachedImagePath?: string;
}

interface WidgetsProps {
  leftPadding?: number;
  rightPadding?: number;
  position?: string;
}

export default function Widgets({leftPadding = 0, rightPadding = 0, position}: WidgetsProps) {
  const flatlistRef = useRef<FlatList<CachedWidgetImage> | null>(null);
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

  // State to store cached images
  const [cachedImages, setCachedImages] = useState<CachedWidgetImage[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const data = useCampaigns<CampaignWidgets>("WID", {position});

  const contentWidth = screenWidth - leftMargin - rightMargin - leftPadding - rightPadding;

  // Cache images and calculate dimensions
  useEffect(() => {
    if (!data?.details?.widget_images) return;

    const cacheImages = async () => {
      const cachedImagePromises = data.details.widget_images.map((item) =>
        new Promise<CachedWidgetImage>((resolve) => {
          checkForImage(item.image, (cachedPath) => {
            resolve({
              ...item,
              cachedImagePath: cachedPath
            });
          });
        })
      );

      try {
        const cachedImageResults = await Promise.all(cachedImagePromises);
        setCachedImages(cachedImageResults);

        // Calculate widget height using the first cached image
        if (cachedImageResults[0]?.cachedImagePath) {
          Image.getSize(
            `file://${cachedImageResults[0].cachedImagePath}`,
            (imgWidth, imgHeight) => {
              const aspectRatio = imgHeight / imgWidth;
              setWidgetHeight(contentWidth * aspectRatio);
              setImagesLoaded(true);
            },
            (error) => {
              console.error("Failed to get image size:", error);
              setImagesLoaded(true); // Set to true even on error to avoid infinite loading
            }
          );
        } else {
          setImagesLoaded(true);
        }

        // Set styling properties
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
      } catch (error) {
        console.error("Error caching images:", error);
        setImagesLoaded(true);
      }
    };

    cacheImages();
  }, [data, contentWidth]);

  const extendedImages = useMemo(() => {
    if (!imagesLoaded || !cachedImages.length) return [];

    return cachedImages.filter((item): item is CachedWidgetImage => item !== undefined);
  }, [cachedImages, imagesLoaded]);

  const scrollToNextImage = () => {
    if (!data) return;

    if (!flatlistRef.current || !extendedImages.length || data.details.type !== "full") return;

    if (activeIndex === data.details.widget_images.length - 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    flatlistRef.current.scrollToOffset({
      offset: contentWidth * (activeIndex + 1),
      animated: true
    });
  };

  useEffect(() => {
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
    data: ArrayLike<CachedWidgetImage> | null | undefined,
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
    viewableItems: { item: CachedWidgetImage }[];
  }) => {
    viewableItems.forEach(({ item }) => {
      trackImpression(item.id);
    });
  };

  const renderFullWidthItem = ({ item, index }: { item: CachedWidgetImage; index: number }) => {
    const imageSource = item.cachedImagePath
      ? { uri: `file://${item.cachedImagePath}` }
      : { uri: item.image }; // Fallback to original URL if caching failed

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
            source={imageSource}
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

  const renderHalfWidthItem = ({ item, index }: { item: CachedWidgetImage; index: number }) => {
    const halfItemWidth = contentWidth * 0.455;
    const halfItemMargin = contentWidth * 0.03;

    const imageSource = item.cachedImagePath
      ? { uri: `file://${item.cachedImagePath}` }
      : { uri: item.image }; // Fallback to original URL if caching failed

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
            source={imageSource}
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

    setActiveIndex(index);

    if (index < data!.details.widget_images.length - 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(scrollToNextImage, 5000);
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const renderDotIndicators = () => {
    return data?.details.widget_images.map((dot, index) => {
      dot
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

  // Don't render until images are loaded/cached
  if (!data || !data.details.widget_images || !imagesLoaded) return null;

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
