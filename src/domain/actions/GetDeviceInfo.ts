import { Dimensions } from "react-native";
import DeviceInfo from "react-native-device-info";
import * as RNLocalize from "react-native-localize";

export const getDeviceInfo = async () => {
    try {
        const { width, height } = Dimensions.get("window");
        const locale = RNLocalize.getLocales()[0];

        const deviceInfo: Record<string, any> = {
            manufacturer: await DeviceInfo.getManufacturer(),
            model: DeviceInfo.getModel(),
            os_version: DeviceInfo.getSystemVersion(),
            api_level: await DeviceInfo.getApiLevel(),
            language: locale?.languageCode,
            locale: locale?.languageTag,
            timezone: RNLocalize.getTimeZone(),
            screen_width_px: width,
            screen_height_px: height,
            screen_density: Dimensions.get("screen").scale,
            orientation: width < height ? "portrait" : "landscape",
            app_version: DeviceInfo.getVersion(),
            package_name: DeviceInfo.getBundleId(),
            device_type: DeviceInfo.isTablet() ? "tablet" : "mobile",
            platform: DeviceInfo.getSystemName().toLowerCase(),
        };

        return deviceInfo;
    } catch (error) {
        console.error("Error fetching device info:", error);
        return {};
    }
};
