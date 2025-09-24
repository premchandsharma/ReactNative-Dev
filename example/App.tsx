import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {AppStorys} from '@appstorys/appstorys-react-native';
import HomeScreen from './src/HomeScreen';
import MoreScreen from './src/MoreScreen';

void AppStorys.initialize(
  "5c45be58-85df-4651-9a66-6c10754e7f54",
  "e3c8ee76-a90c-4673-a9e6-2e49f14425f2",
  "nameisprem",
  // attributes,
);

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen/>;
      case 'more':
        return <MoreScreen/>;
      default:
        return <HomeScreen/>;
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.screenContainer}>
            {renderScreen()}
          </View>

          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'home' && styles.activeTab]}
              onPress={() => setActiveTab('home')}
            >
              <Text style={styles.tabIcon}>🏠</Text>
              <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>
                Home
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'more' && styles.activeTab]}
              onPress={() => setActiveTab('more')}
            >
              <Text style={styles.tabIcon}>⋯</Text>
              <Text style={[styles.tabText, activeTab === 'more' && styles.activeTabText]}>
                More
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
    paddingBottom: 10,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: 'transparent',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
