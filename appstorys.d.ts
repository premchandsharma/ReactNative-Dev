// AppStorys React Native SDK Type Declarations
// Add this to your app's tsconfig.json "include" array or import it in your app

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

export { };
