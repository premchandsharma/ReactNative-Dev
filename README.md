# @appstorys/appstorys-react-native

Official React Native SDK for integrating AppStorys services into a react native application

## Installation

This SDK depends on some other libraries.

```sh
npm install react-native-safe-area-context react-native-encrypted-storage react-native-gesture-handler react-native-reanimated react-native-video
cd ios && pod install && cd ..
```

Be sure you follow all installation instructions:
[react-native-encrypted-storage](https://github.com/emeraldsanto/react-native-encrypted-storage#readme)
[react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation)
[react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/)
[react-native-video](https://thewidlarzgroup.github.io/react-native-video/installation)

```sh
npm install @appstorys/appstorys-react-native
```

## TypeScript Setup

Due to TypeScript's module augmentation limitations, you'll need to manually add the AppStorys type declarations to your project.

### Option 1: Copy the type declarations file

Copy the `appstorys.d.ts` file from the package root to your project's `types` folder or any location included in your `tsconfig.json`:

```sh
# Copy the type declarations
cp node_modules/@appstorys/appstorys-react-native/appstorys.d.ts ./types/
```

### Option 2: Create the type declarations manually

Create a new file `types/appstorys.d.ts` (or any `.d.ts` file) in your project with the following content:

```typescript
declare module 'react-native' {
  interface AccessibilityProps {
    /**
     * AppStorys measurement identifier for tracking user interactions and analytics.
     * This prop is automatically transformed by the AppStorys Babel plugin.
     */
    appstorys?: string;
  }

  interface ButtonProps extends AccessibilityProps {
  }
}

export {};
```

### Option 3: Include in tsconfig.json

Add the type declaration file to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    // ... your existing options
  },
  "include": [
    "src/**/*",
    "node_modules/@appstorys/appstorys-react-native/appstorys.d.ts"
  ]
}
```

After completing one of these steps, you'll be able to use the `appstorys` prop on React Native components with full TypeScript support.

# Publishing new version
Commit all changes and run `npm run prepare && npm run release`