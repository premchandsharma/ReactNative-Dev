import React from 'react';
import {Button, ScrollView, Text, View} from 'react-native';

const TestComponent = () => {
  return (
    <ScrollView testID="main-scroll">
      <View testID="header-container" style={{padding: 20}}>
        <Text testID="title">Welcome to My App</Text>
        <Text>This text has no testID</Text>
      </View>

      <View style={{margin: 10}}>
        <Button testID="primary-button" title="Click Me" onPress={() => {
        }}/>
        <Text testID="description">
          This is a description with a testID
        </Text>
      </View>

      <View testID="nested-container">
        <View testID="inner-view">
          <Text testID="nested-text">Nested content</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default TestComponent;
