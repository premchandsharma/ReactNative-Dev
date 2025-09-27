import {useEffect, useRef, useState} from 'react';
import {Image, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import {CampaignCsat} from '../domain/sdk/types';
import captureCsatResponse from "../domain/actions/captureCsatResponse";
import useCampaigns from "../domain/actions/useCampaigns";
import trackEvent from '../domain/actions/trackEvent';
import usePadding from "../domain/actions/usePadding";
import useKeyboardHeight from "../domain/actions/useKeyboardHeight";

export default function Csat() {
  const [showCsat, setShowCsat] = useState(false);
  const [selectedStars, setSelectedStars] = useState(0);
  const [showThanks, setShowThanks] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [additionalComments, setAdditionalComments] = useState('');
  const keyboardHeight = useKeyboardHeight(() => {
    textInputRef.current?.focus();
    scrollViewRef.current?.scrollToEnd({animated: true});
  });

  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  const data = useCampaigns<CampaignCsat>("CSAT");
  const padding = usePadding('CSAT')?.bottom || 0;

  useEffect(() => {
    if (data && data.id && !viewed.has(data.id)) {
      try {

        const displayDelay = data.details?.styling?.["displayDelay"];
        const delay =
          typeof displayDelay === "string"
            ? parseInt(displayDelay)
            : displayDelay || 0;

        setTimeout(async () => {
          void trackEvent("viewed", data.id)
          setShowCsat(true);
          viewed.add(data.id);
        }, delay * 1000);
      } catch (error) {
        console.error('Error checking CSAT status:', error);
      }
    }
  }, [data]);

  const handleStarPress = (index: number) => {
    const starCount = index + 1;
    setSelectedStars(starCount);

    if (starCount >= 4) {
      setTimeout(() => {
        setShowThanks(true);
        if (data) {
          void captureCsatResponse(
            data.details.id,
            starCount,
            selectedOption || undefined,
            additionalComments || undefined,
          );
        }
      }, 1000);
    } else {
      setShowFeedback(true);
    }
  };

  const handleSubmitFeedback = () => {
    if (data) {
      void captureCsatResponse(
        data.details.id,
        selectedStars,
        selectedOption || undefined,
        additionalComments || undefined,
      );
    }
    setShowThanks(true);
  };

  if (!showCsat || !data || !data.details) {
    return null;
  }

  const feedbackOptions = Object.entries(data.details.feedback_option || {}).map(
    ([key, value]) => ({
      id: key,
      name: value,
    })
  );

  return (

    <View style={[styles.container, {bottom: padding + 10}]}>
      <View style={[styles.card, {backgroundColor: data.details.styling["csatBackgroundColor"]}]}>
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: data.details.styling["csatCtaBackgroundColor"],
            borderRadius: 16,
            padding: 8,
            zIndex: 1,
          }}
          onPress={() => setShowCsat(false)}
        >
          <Image
            source={require("../assets/images/close.png")}
            style={{
              tintColor: data.details.styling["csatCtaTextColor"],
              width: 13,
              height: 13,
            }}
          />
        </TouchableOpacity>
        <ScrollView
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: keyboardHeight * 0.6,
          }}
        >
          {showThanks ? (
            <View style={styles.thanksContainer}>
              {data.details.thankyouImage && (
                <Image
                  source={{uri: data.details.thankyouImage}}
                  style={styles.thanksImage}
                />
              )}
              <Text style={[styles.thanksTitle, {color: data.details.styling.csatTitleColor}]}>
                {data.details.thankyouText}
              </Text>
              <Text style={[styles.thanksDescription, {color: data.details.styling.csatDescriptionTextColor}]}>
                {data.details.thankyouDescription}
              </Text>
              <TouchableOpacity
                style={[styles.button, {backgroundColor: data.details.styling["csatCtaBackgroundColor"]}]}
                onPress={() => {
                  setShowCsat(false);
                  if (selectedStars > 3) {
                    void Linking.openURL(data.details.link);
                  }
                }}

              >
                <Text style={[styles.buttonText, {color: data.details.styling["csatCtaTextColor"]}]}>
                  {
                    selectedStars > 3 ? (data.details.highStarText || "Done") : (data.details.lowStarText || "Done")
                  }
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={[styles.title, {color: data.details.styling["csatTitleColor"]}]}>
                {data.details.title}
              </Text>
              <Text style={[styles.description, {color: data.details.styling["csatDescriptionTextColor"]}]}>
                {data.details.description_text}
              </Text>
              <View style={styles.starsContainer}>
                {Array.from({length: 5}).map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleStarPress(index)}
                    activeOpacity={1}
                  >
                    <Image source={require("../assets/images/star.png")} style={{
                      tintColor:
                        index < selectedStars
                          ? selectedStars > 3
                            ? data.details.styling["csatHighStarColor"]
                            : data.details.styling["csatLowStarColor"]
                          : data.details.styling["csatUnselectedStarColor"],
                      width: 32,
                      height: 32,
                      marginEnd: 6,
                    }}/>
                  </TouchableOpacity>
                ))}
              </View>

              {showFeedback && (
                <View style={styles.feedbackContainer}>
                  {/* <Text style={[styles.feedbackPrompt, { color: data.details.styling.csatDescriptionTextColor }]}>
                    Please tell us what went wrong.
                  </Text> */}
                  {feedbackOptions.map((option) => (
                    <TouchableOpacity
                      activeOpacity={1}
                      key={option.id}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor:
                            selectedOption === option.name
                              ? data.details.styling["csatSelectedOptionBackgroundColor"]
                              : data.details.styling["csatOptionBoxColour"],
                          borderColor:
                            selectedOption === option.name
                              ? data.details.styling["csatSelectedOptionStrokeColor"]
                              : data.details.styling["csatOptionStrokeColor"],
                        },
                      ]}
                      onPress={() => setSelectedOption(option.name)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          {
                            color:
                              selectedOption === option.name
                                ? data.details.styling["csatSelectedOptionTextColor"]
                                : data.details.styling["csatOptionTextColour"],
                          },
                        ]}
                      >
                        {option.name}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <TextInput
                    ref={textInputRef}
                    style={[styles.input, {color: data.details.styling["csatAdditionalTextColor"]}]}
                    value={additionalComments}
                    onChangeText={setAdditionalComments}
                    placeholder="Your feedback"
                    placeholderTextColor={data.details.styling.csatDescriptionTextColor}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({animated: true});
                      }, 300);
                    }}
                  />

                  <TouchableOpacity
                    style={[styles.submitButton, {backgroundColor: data.details.styling["csatCtaBackgroundColor"]}]}
                    onPress={
                      handleSubmitFeedback
                    }
                  >
                    <Text style={[styles.submitText, {color: data.details.styling["csatCtaTextColor"]}]}>
                      Submit
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 10,
    right: 10,
  },
  card: {
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 40,
    paddingRight: 40,
  },
  thanksContainer: {
    alignItems: 'center',
  },
  thanksImage: {
    width: 66,
    height: 66,
  },
  thanksTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  thanksDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginTop: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 12,
  },
  rateText: {
    fontSize: 16,
    marginTop: 8,
    marginLeft: 8,
  },
  feedbackContainer: {
    marginTop: 8,
  },
  feedbackPrompt: {
    fontSize: 14,
    marginBottom: 12,
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 6,
    paddingHorizontal: 12,
    marginVertical: 4,
    alignSelf: 'flex-start',
  },
  optionText: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  button: {
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 6,
    marginTop: 16,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 6,
    marginTop: 18,
    alignSelf: 'flex-start',
  },
  submitText: {
    fontWeight: '600',
    fontSize: 16,
  },
});

const viewed = new Set<string>();
