# @appstorys/appstorys-react-native

Official React Native SDK for integrating AppStorys services into a react native application

## Installation

This SDK depends on some other libraries.

```sh
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack react-native-screens react-native-safe-area-context react-native-encrypted-storage react-native-gesture-handler react-native-reanimated react-native-video
cd ios && pod install && cd ..
```

Be sure you follow all installation instructions:
[@react-navigation/native](https://reactnavigation.org/docs/getting-started/)
[@react-navigation/bottom-tabs](https://reactnavigation.org/docs/bottom-tab-navigator)
[@react-navigation/stack](https://reactnavigation.org/docs/stack-navigator)
[react-native-encrypted-storage](https://github.com/emeraldsanto/react-native-encrypted-storage#readme)
[react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation)
[react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/)
[react-native-video](https://thewidlarzgroup.github.io/react-native-video/installation)

```sh
npm install @appstorys/appstorys-react-native
```

# Publishing new version
Commit all changes and run `npm run prepare && npm run release`