import React from 'react';
import { Button, ScrollView, Text, View } from 'react-native';

const TestComponent = () => {
  return (
    <ScrollView appstorys="main-scroll">
      <View appstorys="header-container" style={{ padding: 20 }}>
        <Text appstorys="title">Welcome to My App</Text>
        <Text>This text has no appstorys prop</Text>
      </View>

      <View style={{ margin: 10 }}>
        <Button appstorys="primary-button" title="Click Me" onPress={() => {
        }} />
        <Text appstorys="description">
          This is a description with an appstorys prop
        </Text>
      </View>

      <View appstorys="nested-container">
        <View appstorys="inner-view">
          <Text appstorys="nested-text">Nested content</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default TestComponent;
