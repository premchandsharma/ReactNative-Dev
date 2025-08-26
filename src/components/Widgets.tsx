import {
    FlatList,
    Image,
    Linking,
    View,
    Dimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
    TouchableOpacity,
} from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { UserActionTrack } from "../utils/trackuseraction";
import { CampaignWidgets, UserData } from "../sdk";

export type WidgetsProps = {
} & UserData;

interface WidgetImage {
    id: string;
    image: string;
    link: string;
    order: number;
}

const Widgets: React.FC<WidgetsProps> = ({
    campaigns,
    user_id,
}) => {
    const flatlistRef = useRef<FlatList<WidgetImage> | null>(null);
    const screenWidth = Dimensions.get("window").width;
    const [activeIndex, setActiveIndex] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const data = useMemo(
        () =>
            campaigns.find((val) => val.campaign_type === "WID") as CampaignWidgets,
        [campaigns],
    );

    const extendedImages = useMemo(() => {
        if (!data?.details?.widget_images) return [];
        return data.details.type === "full"
            ? [
                data.details.widget_images[data.details.widget_images.length - 1],
                ...data.details.widget_images,
                data.details.widget_images[0],
            ].filter((item): item is WidgetImage => item !== undefined)
            : data.details.widget_images.filter((item): item is WidgetImage => item !== undefined);

    }, [data]);

    // useEffect(() => {
    //     if (data && data.id) {
    //         UserActionTrack(user_id, data.id, "IMP");
    //     }
    // }, [data, user_id]);

    const scrollToNextImage = () => {
        if (!flatlistRef.current || !extendedImages.length || data.details.type !== "full") return;

        // const nextIndex = activeIndex === data.details.widget_images.length - 1 ? 0 : activeIndex + 1;

        if (activeIndex === data.details.widget_images.length - 1) {
            flatlistRef.current.scrollToOffset({
                offset: screenWidth,
                animated: false
            });
            setTimeout(() => {
                scrollToNextImage
            }, 50);
        } else {
            flatlistRef.current.scrollToOffset({
                offset: screenWidth * (activeIndex + 2),
                animated: true
            });
        }
    };

    useEffect(() => {
        // if (data.details.type !== "full") return;

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(scrollToNextImage, 5000);

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
        length: screenWidth,
        offset: screenWidth * index,
        index: index,
    });

    const trackedImpressionsRef = useRef<string[]>([]);

    const trackImpression = (widget_image_id: string) => {
        if (!trackedImpressionsRef.current.includes(widget_image_id)) {
            console.log(`Tracking impression for: ${widget_image_id}`); // Debug log
            trackedImpressionsRef.current.push(widget_image_id);
            UserActionTrack(user_id, data.id, "IMP", undefined, widget_image_id);
        } else {
            console.log(`Impression already tracked for: ${widget_image_id}`); // Debug log
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
                    width: screenWidth * 0.94,
                    marginHorizontal: screenWidth * 0.03,
                }}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {

                        if (item.link) {
                            UserActionTrack(user_id, data.id, "CLK", undefined, item.id);
                            Linking.openURL(item.link);
                        }
                    }}
                >
                    <Image
                        source={{ uri: item.image }}
                        style={{
                            borderRadius: 18,
                            height: data.details.height ?? 100,
                            resizeMode: 'cover',
                        }}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    const renderHalfWidthItem = ({ item, index }: { item: WidgetImage; index: number }) => {
        return (
            <View
                key={`${item.order}-${index}`}
                style={{
                    width: screenWidth * 0.455,
                    marginLeft: screenWidth * 0.03,
                }}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {

                        if (item.link) {
                            UserActionTrack(user_id, data.id, "CLK", undefined, item.id);
                            Linking.openURL(item.link);
                        }
                    }}
                >
                    <Image
                        source={{ uri: item.image }}
                        style={{
                            borderRadius: 12,
                            height: data.details.height ?? 200, // Make it square
                            resizeMode: 'cover',
                        }}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (data.details.type !== "full") return;

        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / screenWidth);

        if (index === 0) {
            flatlistRef.current?.scrollToOffset({
                offset: screenWidth * (extendedImages.length - 2),
                animated: false
            });
            setActiveIndex(extendedImages.length - 3);
        } else if (index === extendedImages.length - 1) {
            flatlistRef.current?.scrollToOffset({
                offset: screenWidth,
                animated: false
            });
            setActiveIndex(0);
        } else {
            setActiveIndex(index - 1);
        }

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = setInterval(scrollToNextImage, 5000);
        }
    };

    const renderDotIndicators = () => {
        return data.details.widget_images.map((dot, index) => {
            console.log(dot);
            return (
                <View
                    key={index}
                    style={{
                        backgroundColor: activeIndex === index ? "black" : "grey",
                        height: 6,
                        width: 6,
                        borderRadius: 5,
                        marginHorizontal: 4,
                        marginVertical: 6,
                    }}
                />
            );
        });
    };

    if (!data || !data.details.widget_images) return null;

    return (
        <View style={{
            // height: data.details.type === "full" ? 160 : screenWidth * 0.44,
            width: '100%',
            marginVertical: screenWidth * 0.03,
            paddingRight: data.details.type === "half" ? screenWidth * 0.03 : null,
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
                initialScrollIndex={data.details.type === "full" ? 1 : undefined}
                onLayout={() => {
                    if (data.details.type === "full") {
                        flatlistRef.current?.scrollToOffset({
                            offset: screenWidth,
                            animated: false
                        });
                    }
                }}
                scrollEnabled={data.details.type === "full"}
            />

            {data.details.type === "full" && (
                <View style={{
                    position: 'absolute',
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

export default Widgets;