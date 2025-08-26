// import React, { useState, useRef, useEffect, useMemo } from 'react';
// import {
//   View,
//   Text,
//   Modal,
//   StyleSheet,
//   Dimensions,
//   TouchableWithoutFeedback,
//   LayoutRectangle,
//   StyleProp,
//   ViewStyle,
//   Animated,
// } from 'react-native';

// import { CampaignBanner, CampaignSpotlight, UserData } from "../sdk";
// import { UserActionTrack } from '../utils/trackuseraction';

// export type TooltipProps = {
//   children: React.ReactNode;
//   target_element: string;
//   // position?: 'top' | 'bottom' | 'left' | 'right';
//   arrowSize?: number;
//   tooltipWidth?: number;
// } & UserData;

// interface ArrowStyle extends ViewStyle {
//   borderTopColor?: string;
//   borderRightColor?: string;
//   borderBottomColor?: string;
//   borderLeftColor?: string;
//   borderTopWidth: number;
//   borderRightWidth: number;
//   borderBottomWidth: number;
//   borderLeftWidth: number;
// }


// const Tooltip: React.FC<TooltipProps> = ({
//   campaigns,
//   user_id,
//   children,
//   target_element,
//   arrowSize = 10,
//   tooltipWidth = 200,
// }) => {
//   const [isSpotlightVisible, setIsSpotlightVisible] = useState(true);
//   const [childLayout, setChildLayout] = useState<LayoutRectangle | null>(null);
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const childRef = useRef<View>(null);

//   const data = useMemo(
//     () =>
//       campaigns.find((val) => val.campaign_type === "SPO") as CampaignSpotlight,
//     [campaigns],
//   );

//   useEffect(() => {
//     if (data && data.id) {
//       UserActionTrack(user_id, data.id, "IMP");
//     }
//     if (isSpotlightVisible) {
//       Animated.timing(fadeAnim, {
//         toValue: data.details.background_opacity,
//         duration: data.details.animation_duration,
//         useNativeDriver: true,
//       }).start();
//     } else {
//       fadeAnim.setValue(0);
//     }
//   }, [isSpotlightVisible]);

//   const measureChildLayout = () => {
//     if (childRef.current) {
//       childRef.current.measureInWindow((x, y, width, height) => {
//         setChildLayout({ x, y, width, height });
//       });
//     }
//   };

//   const getTooltipPosition = (): StyleProp<ViewStyle> => {
//     if (!childLayout) return {};

//     const { x, y, width, height } = childLayout;
//     const tooltipHeight = 80;

//     let tooltipStyle: ViewStyle = {
//       position: 'absolute',
//       width: tooltipWidth,
//     };

//     switch (data.details.position) {
//       case 'top':
//         tooltipStyle = {
//           ...tooltipStyle,
//           left: x + width / 2 - tooltipWidth / 2,
//           top: y - tooltipHeight - arrowSize,
//         };
//         break;
//       case 'bottom':
//         tooltipStyle = {
//           ...tooltipStyle,
//           left: x + width / 2 - tooltipWidth / 2,
//           top: y + height + arrowSize,
//         };
//         break;
//       // case 'left':
//       //   tooltipStyle = {
//       //     ...tooltipStyle,
//       //     left: x - tooltipWidth - arrowSize,
//       //     top: y + height / 2 - tooltipHeight / 2,
//       //   };
//       //   break;
//       // case 'right':
//       //   tooltipStyle = {
//       //     ...tooltipStyle,
//       //     left: x + width + arrowSize,
//       //     top: y + height / 2 - tooltipHeight / 2,
//       //   };
//       //   break;
//     }

//     return tooltipStyle;
//   };

//   const getArrowStyle = (): StyleProp<ArrowStyle> => {
//     const baseArrowStyle: ArrowStyle = {
//       position: 'absolute',
//       width: 0,
//       height: 0,
//       backgroundColor: 'transparent',
//       borderStyle: 'solid',
//       borderTopWidth: arrowSize,
//       borderRightWidth: arrowSize,
//       borderBottomWidth: arrowSize,
//       borderLeftWidth: arrowSize,
//     };

//     switch (data.details.position) {
//       case 'top':
//         return {
//           ...baseArrowStyle,
//           bottom: -arrowSize,
//           left: tooltipWidth / 2 - arrowSize,
//           borderTopColor: '#333',
//           borderRightColor: 'transparent',
//           borderBottomColor: 'transparent',
//           borderLeftColor: 'transparent',
//         };
//       case 'bottom':
//         return {
//           ...baseArrowStyle,
//           top: -arrowSize,
//           left: tooltipWidth / 2 - arrowSize,
//           borderTopColor: 'transparent',
//           borderRightColor: 'transparent',
//           borderBottomColor: '#333',
//           borderLeftColor: 'transparent',
//         };
//       // case 'left':
//       //   return {
//       //     ...baseArrowStyle,
//       //     right: -arrowSize,
//       //     top: tooltipWidth / 2 - arrowSize,
//       //     borderTopColor: 'transparent',
//       //     borderRightColor: 'transparent',
//       //     borderBottomColor: 'transparent',
//       //     borderLeftColor: '#333',
//       //   };
//       // case 'right':
//       //   return {
//       //     ...baseArrowStyle,
//       //     left: -arrowSize,
//       //     top: tooltipWidth / 2 - arrowSize,
//       //     borderTopColor: 'transparent',
//       //     borderRightColor: '#333',
//       //     borderBottomColor: 'transparent',
//       //     borderLeftColor: 'transparent',
//       //   };
//     }
//   };

//   useEffect(() => {
//     if (isSpotlightVisible) {
//       measureChildLayout();
//     }
//   }, [isSpotlightVisible]);

//   const renderOverlay = () => {
//     if (!childLayout) return null;

//     const { x, y, width, height } = childLayout;
//     const windowDimensions = Dimensions.get('window');

//     return (

//       <>

//         {/* Top overlay */}
//         <Animated.View
//           style={[
//             styles.overlay,
//             { opacity: fadeAnim },
//             {
//               top: 0,
//               left: 0,
//               right: 0,
//               height: y,
//             },
//           ]}
//         />
//         {/* Left overlay */}
//         <Animated.View
//           style={[
//             styles.overlay,
//             { opacity: fadeAnim },
//             {
//               top: y,
//               left: 0,
//               width: x,
//               height: height,
//             },
//           ]}
//         />
//         {/* Right overlay */}
//         <Animated.View
//           style={[
//             styles.overlay,
//             { opacity: fadeAnim },
//             {
//               top: y,
//               left: x + width,
//               right: 0,
//               height: height,
//             },
//           ]}
//         />
//         {/* Bottom overlay */}
//         <Animated.View
//           style={[
//             styles.overlay,
//             { opacity: fadeAnim },
//             {
//               top: y + height,
//               left: 0,
//               right: 0,
//               bottom: 0,
//             },
//           ]}
//         />
//       </>
//     );
//   };


//   // Add checks here
//   return (
//     <>
//       {data  && target_element == data.details.target_element && (
//         <View>
//           <View ref={childRef} onLayout={measureChildLayout}>
//             {children}
//           </View>
//           <Modal visible={isSpotlightVisible} transparent>
//             <TouchableWithoutFeedback onPress={()=>{
//               setIsSpotlightVisible(false)
//             }}>
//               <View style={{
//                 flex: 1,
//               }}>
//                 {renderOverlay()}
//                 {childLayout && (
//                   <View
//                     style={{
//                       position: 'absolute',
//                       borderRadius: 4,
//                       zIndex: 1,
//                       top: childLayout.y,
//                       left: childLayout.x,
//                       width: childLayout.width,
//                       height: childLayout.height,
//                     }}
//                   />
//                 )}
//                 {childLayout && (
//                   <View style={[{
//                     position: 'absolute',
//                     zIndex: 2,
//                   }, getTooltipPosition()]}>
//                     <View style={{
//                       borderRadius: 4,
//                       padding: 8,
//                     }}>
//                       <Text style={{
//                         textAlign: 'center',
//                         textAlignVertical: 'center',
//                         color: data.details.styling['text_color'],
//                         fontSize: 18,
//                         padding: 12,
//                       }}>{data.details.title}</Text>
//                       <Text style={{
//                         textAlign: 'center',
//                         textAlignVertical: 'center',
//                         color: data.details.styling['text_color'],
//                         fontSize: 14,
//                       }}>{data.details.description_text}</Text>
//                       <View style={[styles.arrow, getArrowStyle()]} />
//                     </View>
//                   </View>
//                 )}
//               </View>

//             </TouchableWithoutFeedback>
//           </Modal>
//         </View>
//       )}
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     position: 'absolute',
//     backgroundColor: 'black',
//   },
//   arrow: {
//     position: 'absolute',
//   },
// });

// export default Tooltip;