import React, {useEffect} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppStorys} from '@appstorys/appstorys-react-native';

export default function MoreScreen() {
  useEffect(() => {
    void AppStorys.trackScreen("More Screen React");
  }, []);
  return (
    <AppStorys.Screen name="More Screen React" options={{
      overlayPadding: {
        pip: 40
      }
    }}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>More</Text>
            <Text style={styles.subtitle}>Additional options and settings</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <TouchableOpacity style={styles.menuItem} appstorys="profile-option">
              <Text style={styles.menuText}>Profile Settings</Text>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} appstorys="notifications-option">
              <Text style={styles.menuText}>Notifications</Text>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App</Text>
            <TouchableOpacity style={styles.menuItem} appstorys="about-option">
              <Text style={styles.menuText}>About</Text>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} appstorys="help-option">
              <Text style={styles.menuText}>Help & Support</Text>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} appstorys="privacy-option">
              <Text style={styles.menuText}>Privacy Policy</Text>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Debug</Text>
            <TouchableOpacity
              style={styles.menuItem}
              appstorys="track-event-option"
              onPress={() => AppStorys.trackEvent('More Screen Action')}
            >
              <Text style={styles.menuText}>Track Test Event</Text>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>App Version 1.0.0</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppStorys.Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    paddingLeft: 5,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  arrow: {
    fontSize: 18,
    color: '#666',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
});
