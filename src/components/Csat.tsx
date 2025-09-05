import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import {CampaignCsat} from '../domain/sdk/types';
import trackUserAction from "../domain/actions/trackUserAction";
import captureCsatResponse from "../domain/actions/captureCsatResponse";
import useCampaigns from "../domain/actions/useCampaigns";

export default function Csat() {
  const [showCsat, setShowCsat] = useState(true);
  const [selectedStars, setSelectedStars] = useState(0);
  const [showThanks, setShowThanks] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [additionalComments, setAdditionalComments] = useState('');

  const [_showCsat, set_ShowCsat] = useState(false);
  const [csatLocalValue, setCsatLocalValue] = useState('');

  const data = useCampaigns<CampaignCsat>("CSAT");

  useEffect(() => {
    if (data && data.id) {
      _initializeCsat();
      void _ifshowCsat();
    }
    console.log(csatLocalValue)
  }, [data]);

  const _initializeCsat = () => {
    if (!data) return;

  };

  const _ifshowCsat = async () => {
    try {
      const csatLoaded = await AsyncStorage.getItem('csat_loaded');
      setCsatLocalValue(csatLoaded || '');

      if (!csatLoaded || csatLoaded !== 'true') {
        await _scheduleCsatDisplay();
      }
    } catch (error) {
      console.error('Error checking CSAT status:', error);
    }
  };

  const _scheduleCsatDisplay = async () => {
    const delayDisplay = data?.details?.styling?.delayDisplay;
    const delay = delayDisplay ? parseInt(delayDisplay) : 0;

    setTimeout(async () => {
      if (data) {
        try {
          void trackUserAction(data.id, "IMP");
          set_ShowCsat(true);
          await AsyncStorage.setItem('csat_loaded', 'true');
        } catch (error) {
          console.error('Error saving CSAT status:', error);
        }
      }
    }, delay * 1000);
  };

  const handleStarPress = (index: number) => {
    const starCount = index + 1;
    setSelectedStars(starCount);

    if (starCount >= 4) {
      setTimeout(() => {
        setShowThanks(true);
        if (data) {
          console.log(starCount);
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
      console.log(selectedStars);
      void captureCsatResponse(
        data.details.id,
        selectedStars,
        selectedOption || undefined,
        additionalComments || undefined,
      );
    }
    setShowThanks(true);
  };

  if (!showCsat || !_showCsat || !data || !data.details) {
    return null;
  }

  const feedbackOptions = Object.entries(data.details.feedback_option || {}).map(
    ([key, value]) => ({
      id: key,
      name: value,
    })
  );

  return (
    <View style={styles.container}>
      <View style={[styles.card, {backgroundColor: data.details.styling.csatBackgroundColor}]}>
        <ScrollView>
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
                style={[styles.button, {backgroundColor: data.details.styling.csatCtaBackgroundColor}]}
                onPress={() => setShowCsat(false)}
              >
                <Text style={[styles.buttonText, {color: data.details.styling.csatCtaTextColor}]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={[styles.title, {color: data.details.styling.csatTitleColor}]}>
                {data.details.title}
              </Text>
              <Text style={[styles.description, {color: data.details.styling.csatDescriptionTextColor}]}>
                {data.details.description_text}
              </Text>
              <View style={styles.starsContainer}>
                {Array.from({length: 5}).map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleStarPress(index)}
                    activeOpacity={1}
                  >
                    {/* <Text style={[
                      styles.star,
                      { color: index < selectedStars ? '#FFD700' : '#B0B0B0' }
                    ]}>
                      ★
                    </Text> */}
                    <Image source={require("../assets/images/star.png")} style={{
                      tintColor: index < selectedStars ? '#FFD700' : '#B0B0B0',
                      width: 32,
                      height: 32,
                      marginHorizontal: 3,
                    }}/>
                  </TouchableOpacity>
                ))}
              </View>

              {!showFeedback ? (
                <Text style={[styles.rateText, {color: data.details.styling.csatDescriptionTextColor}]}>
                  Rate Us!
                </Text>
              ) : (
                <View style={styles.feedbackContainer}>
                  <Text style={[styles.feedbackPrompt, {color: data.details.styling.csatDescriptionTextColor}]}>
                    Please tell us what went wrong.
                  </Text>
                  {feedbackOptions.map((option) => (
                    <TouchableOpacity
                      activeOpacity={1}
                      key={option.id}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: selectedOption === option.name
                            ? data.details.styling.csatSelectedOptionBackgroundColor
                            : data.details.styling.csatBackgroundColor,
                          borderColor: data.details.styling.csatOptionStrokeColor
                        }
                      ]}
                      onPress={() => setSelectedOption(option.name)}
                    >
                      <Text style={[
                        styles.optionText,
                        {
                          color: selectedOption === option.name
                            ? data.details.styling.csatSelectedOptionTextColor
                            : data.details.styling.csatOptionTextColour
                        }
                      ]}>
                        {option.name}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <TextInput
                    style={[styles.input, {color: data.details.styling.csatDescriptionTextColor}]}
                    value={additionalComments}
                    onChangeText={setAdditionalComments}
                    placeholder="Your feedback"
                    placeholderTextColor={data.details.styling.csatDescriptionTextColor}
                  />

                  <TouchableOpacity
                    style={[styles.submitButton, {backgroundColor: data.details.styling.csatCtaBackgroundColor}]}
                    onPress={handleSubmitFeedback}
                  >
                    <Text style={[styles.submitText, {color: data.details.styling.csatCtaTextColor}]}>
                      Submit
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            backgroundColor: data.details.styling['csatCtaBackgroundColor'],
            borderRadius: 16,
            padding: 8,
          }}
          onPress={() => setShowCsat(false)}
        >
          <Image source={require("../assets/images/close.png")} style={{
            tintColor: data.details.styling['csatCtaTextColor'],
            width: 13,
            height: 13,
          }}/>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  card: {
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 40,
    paddingRight: 40,
    position: 'relative',
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
