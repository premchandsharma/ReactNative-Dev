import {Button, ScrollView, Switch, Text, TextInput, TouchableOpacity, View} from "react-native";
import {AppStorys} from '@appstorys/appstorys-react-native';
import {useEffect, useState} from "react";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";

void AppStorys.initialize(
  "9e1b21a2-350a-4592-918c-2a19a73f249a",
  "4350bf8e-0c9a-46bd-b953-abb65ab21d11",
  "nameisprem",
  // attributes,
);

export default function App() {
  const [switchValue, setSwitchValue] = useState(false);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    console.log('Tracking Home Screen React');
    void AppStorys.trackScreen("Home Screen React");
  }, []);

  return (
    <AppStorys.MeasurementProvider>
      <SafeAreaProvider>
        <SafeAreaView>
          <ScrollView  
            // showsVerticalScrollIndicator={true}
          >
            <View style={{padding: 20}} testID="container">
            <View style={{backgroundColor: '#f0f0f0', padding: 10, marginBottom: 15}} key="header-container"
                  testID="main-header-view">
              <Text style={{fontSize: 24, fontWeight: 'bold', textAlign: 'center'}} key="title-text" testID="app-title">
                Testing AppStorys SDK
              </Text>
            </View>

            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20}} key="controls-row"
                  testID="controls-container">
              <Button title="Track Screen" key="track-btn" testID="track-screen-button"/>
              <TouchableOpacity
                style={{backgroundColor: '#007AFF', padding: 10, borderRadius: 5}}
                key="custom-touch"
                testID="custom-touchable-button"
              >
                <Text style={{color: 'white'}} key="touch-text" testID="touchable-text">Custom Button</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={{borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5}}
              placeholder="Enter some text..."
              value={inputText}
              onChangeText={setInputText}
              key="text-input"
              testID="main-text-input"
            />

            <View
              style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15}}
              key="switch-row" testID="switch-container">
              <Text key="switch-label" testID="switch-label-text">Enable notifications:</Text>
              <Switch
                value={switchValue}
                onValueChange={setSwitchValue}
                key="notification-switch"
                testID="notification-toggle-switch"
              />
            </View>

            <View style={{backgroundColor: '#e8f4f8', padding: 15, borderRadius: 10, marginBottom: 20}} key="info-card"
                  testID="information-card">
              <Text style={{fontSize: 16, marginBottom: 10}} key="info-title" testID="card-title">
                Random Information Card
              </Text>
              <Text style={{color: '#666'}} key="info-desc" testID="card-description">
                This is some random content to make the screen more complex and realistic.
              </Text>
            </View>

            <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20}} key="tag-container"
                  testID="tags-wrapper">
              <View style={{backgroundColor: '#ff6b6b', padding: 8, margin: 4, borderRadius: 15}} key="tag-1"
                    testID="red-tag">
                <Text style={{color: 'white', fontSize: 12}} key="tag-1-text" testID="red-tag-text">React</Text>
              </View>
              <View style={{backgroundColor: '#4ecdc4', padding: 8, margin: 4, borderRadius: 15}} key="tag-2"
                    testID="teal-tag">
                <Text style={{color: 'white', fontSize: 12}} key="tag-2-text" testID="teal-tag-text">Native</Text>
              </View>
              <View style={{backgroundColor: '#45b7d1', padding: 8, margin: 4, borderRadius: 15}} key="tag-3"
                    testID="blue-tag">
                <Text style={{color: 'white', fontSize: 12}} key="tag-3-text" testID="blue-tag-text">SDK</Text>
              </View>
            </View>

            <View style={{borderWidth: 2, borderColor: '#ddd', borderStyle: 'dashed', padding: 20, marginBottom: 15}}
                  key="dashed-container" testID="dashed-border-view">
              <Text style={{textAlign: 'center', fontStyle: 'italic'}} key="placeholder-text"
                    testID="placeholder-content">
                Placeholder Content Area
              </Text>
            </View>

            <View style={{flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20}} key="icon-row"
                  testID="icon-buttons-row">
              <TouchableOpacity style={{alignItems: 'center'}} key="like-btn" testID="like-button">
                <View style={{
                  width: 40,
                  height: 40,
                  backgroundColor: '#ff4757',
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center'
                }} key="like-circle" testID="like-icon-circle">
                  <Text style={{color: 'white', fontSize: 20}} key="like-icon" testID="like-heart-icon">♥</Text>
                </View>
                <Text style={{marginTop: 5, fontSize: 12}} key="like-label" testID="like-button-label">Like</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{alignItems: 'center'}} key="share-btn" testID="share-button">
                <View style={{
                  width: 40,
                  height: 40,
                  backgroundColor: '#3742fa',
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center'
                }} key="share-circle" testID="share-icon-circle">
                  <Text style={{color: 'white', fontSize: 20}} key="share-icon" testID="share-arrow-icon">↗</Text>
                </View>
                <Text style={{marginTop: 5, fontSize: 12}} key="share-label" testID="share-button-label">Share</Text>
              </TouchableOpacity>

              <AppStorys.Banner/>

              {/* <AppStorys.Floater/> */}

              <AppStorys.Csat/>
              <AppStorys.Modal/>

              <TouchableOpacity style={{alignItems: 'center'}} key="save-btn" testID="save-button">
                <View style={{
                  width: 40,
                  height: 40,
                  backgroundColor: '#2ed573',
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center'
                }} key="save-circle" testID="save-icon-circle">
                  <Text style={{color: 'white', fontSize: 20}} key="save-icon" testID="save-bookmark-icon">★</Text>
                </View>
                <Text style={{marginTop: 5, fontSize: 12}} key="save-label" testID="save-button-label">Save</Text>
              </TouchableOpacity>
            </View>

            <View style={{
              backgroundColor: '#fff3cd',
              borderColor: '#856404',
              borderWidth: 1,
              padding: 10,
              borderRadius: 5,
              marginBottom: 20
            }} key="warning-banner" testID="warning-notification">
              <Text style={{color: '#856404', fontWeight: 'bold'}} key="warning-text" testID="warning-message">
                ⚠️ This is a warning message for testing purposes
              </Text>
            </View>

            <AppStorys.CaptureScreenButton screenName={"Home Screen React"} key="capture-btn"/>

            <View
              style={{
                height: 100,
                backgroundColor: '#f8f9fa',
                marginTop: 20,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              key="footer-spacer" testID="bottom-spacer">
              <Text style={{color: '#6c757d'}} key="footer-text" testID="footer-placeholder">
                Footer Placeholder
              </Text>
            </View>

            <View
              style={{
                height: 100,
                backgroundColor: '#f8f9fa',
                marginTop: 20,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              key="footer-spacer" testID="bottom-spacer">
              <Text style={{color: '#6c757d'}} key="footer-text" testID="footer-placeholder">
                Footer Placeholder
              </Text>
            </View>

            <View
              style={{
                height: 100,
                backgroundColor: '#f8f9fa',
                marginTop: 20,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              key="footer-spacer" testID="bottom-spacer">
              <Text style={{color: '#6c757d'}} key="footer-text" testID="footer-placeholder">
                Footer Placeholder
              </Text>
            </View>

            <View
              style={{
                height: 100,
                backgroundColor: '#f8f9fa',
                marginTop: 20,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              key="footer-spacer" testID="bottom-spacer">
              <Text style={{color: '#6c757d'}} key="footer-text" testID="footer-placeholder">
                Footer Placeholder
              </Text>
            </View>
          </View>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </AppStorys.MeasurementProvider>
  );
}
