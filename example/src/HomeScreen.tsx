import React, {useEffect, useState} from 'react';
import {Button, ScrollView, Switch, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppStorys} from '@appstorys/appstorys-react-native';

export default function HomeScreen() {
  const [switchValue, setSwitchValue] = useState(false);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    AppStorys.initialize(
      "9e1b21a2-350a-4592-918c-2a19a73f249a",
      "4350bf8e-0c9a-46bd-b953-abb65ab21d11",
      "nameisprem",
      // attributes,
    ).then(() => console.log('AppStorys SDK initialized'))
      .catch((error) => console.error('Failed to initialize AppStorys SDK:', error));
  }, []);

  return (
    <AppStorys.Screen name="Home Screen React" options={{
      overlayPadding: {
        pip: 90
      }
    }}>
      <SafeAreaView>
        <ScrollView
          contentContainerStyle={{flexGrow: 1, backgroundColor: 'white'}}
        >
          <View style={{
            padding: 20
          }} appstorys="container">
            <View style={{backgroundColor: '#f0f0f0', padding: 10, marginBottom: 15}}
                  appstorys="main-header-view">

            </View>

            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20}}
                  appstorys="controls-container">
              <Button title="Track Screen" appstorys="track-screen-button"/>
              <TouchableOpacity
                style={{backgroundColor: '#007AFF', padding: 10, borderRadius: 5}}
                appstorys="custom-touchable-button"
                onPress={() => void AppStorys.trackEvent('Login')}
              >
                <Text style={{color: 'white'}} appstorys="touchable-text">Custom Button</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={{borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5}}
              placeholder="Enter some text..."
              value={inputText}
              onChangeText={setInputText}
              appstorys="main-text-input"
            />

            <AppStorys.Stories/>

            <AppStorys.Widgets
              leftPadding={20}
              rightPadding={20}
            />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 15
              }}
              appstorys="switch-container">
              <Text appstorys="switch-label-text">Enable notifications:</Text>
              <Switch
                value={switchValue}
                onValueChange={setSwitchValue}
                appstorys="notification-toggle-switch"
              />
            </View>

            <View style={{backgroundColor: '#e8f4f8', padding: 15, borderRadius: 10, marginBottom: 20}}
                  appstorys="information-card">
              <Text style={{fontSize: 16, marginBottom: 10}} appstorys="card-title">
                Random Information Card
              </Text>
              <Text style={{color: '#666'}} appstorys="card-description">
                This is some random content to make the screen more complex and realistic.
              </Text>
            </View>

            <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20}}
                  appstorys="tags-wrapper">
              <View style={{backgroundColor: '#ff6b6b', padding: 8, margin: 4, borderRadius: 15}}
                    appstorys="red-tag">
                <Text style={{color: 'white', fontSize: 12}} appstorys="red-tag-text">React</Text>
              </View>
              <View style={{backgroundColor: '#4ecdc4', padding: 8, margin: 4, borderRadius: 15}}
                    appstorys="teal-tag">
                <Text style={{color: 'white', fontSize: 12}} appstorys="teal-tag-text">Native</Text>
              </View>
              <View style={{backgroundColor: '#45b7d1', padding: 8, margin: 4, borderRadius: 15}}
                    appstorys="blue-tag">
                <Text style={{color: 'white', fontSize: 12}} appstorys="blue-tag-text">SDK</Text>
              </View>
            </View>

            <View
              style={{borderWidth: 2, borderColor: '#ddd', borderStyle: 'dashed', padding: 20, marginBottom: 15}}
              appstorys="dashed-border-view">
              <Text style={{textAlign: 'center', fontStyle: 'italic'}}
                    appstorys="placeholder-content">
                Placeholder Content Area
              </Text>
            </View>

            <View style={{flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20}}
                  appstorys="icon-buttons-row">
              <TouchableOpacity style={{alignItems: 'center'}} appstorys="like-button"
                                onPress={() => AppStorys.trackEvent('Open Bottom Sheet')}>
                <View style={{
                  width: 40,
                  height: 40,
                  backgroundColor: '#ff4757',
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center'
                }} appstorys="like-icon-circle">
                  <Text style={{color: 'white', fontSize: 20}} appstorys="like-heart-icon">♥</Text>
                </View>
                <Text style={{marginTop: 5, fontSize: 12}} appstorys="like-button-label">Like</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{alignItems: 'center'}} appstorys="share-button">
                <View style={{
                  width: 40,
                  height: 40,
                  backgroundColor: '#3742fa',
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center'
                }} appstorys="share-icon-circle">
                  <Text style={{color: 'white', fontSize: 20}} appstorys="share-arrow-icon">↗</Text>
                </View>
                <Text style={{marginTop: 5, fontSize: 12}} appstorys="share-button-label">Share</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{alignItems: 'center'}} appstorys="save-button">
                <View style={{
                  width: 40,
                  height: 40,
                  backgroundColor: '#2ed573',
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center'
                }} appstorys="save-icon-circle">
                  <Text style={{color: 'white', fontSize: 20}} appstorys="save-bookmark-icon">★</Text>
                </View>
                <Text style={{marginTop: 5, fontSize: 12}} appstorys="save-button-label">Save</Text>
              </TouchableOpacity>
            </View>

            <View style={{
              backgroundColor: '#fff3cd',
              borderColor: '#856404',
              borderWidth: 1,
              padding: 10,
              borderRadius: 5,
              marginBottom: 20
            }} appstorys="warning-notification">
              <Text style={{color: '#856404', fontWeight: 'bold'}} appstorys="warning-message">
                ⚠️ This is a warning message for testing purposes
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
              appstorys="bottom-spacer">
              <Text style={{color: '#6c757d'}} appstorys="footer-placeholder">
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
              appstorys="bottom-spacer">
              <Text style={{color: '#6c757d'}} appstorys="footer-placeholder">
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
              appstorys="bottom-spacer">
              <Text style={{color: '#6c757d'}} appstorys="footer-placeholder">
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
              appstorys="bottom-spacer">
              <Text style={{color: '#6c757d'}} appstorys="footer-placeholder">
                Footer Placeholder
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppStorys.Screen>
  );
}
