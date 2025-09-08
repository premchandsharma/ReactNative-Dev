import {sendOrQueue} from "./offlineQueue";
import {getAccessToken, getUserId} from "../sdk/store";
import {Attributes} from "../sdk/types";
import getDeviceInfo from "./getDeviceInfo";

export default async function setUserProperties(attributes: Attributes) {
    try {
        const access_token = await getAccessToken();
        const userId = getUserId();

        if (!access_token || !userId) {
            console.warn("Missing accessToken or userId");
            return;
        }

        const deviceInfo = await getDeviceInfo();

        const mergedMetadata = {
            ...(attributes || {}),
            ...deviceInfo,
        };

        const bodyData: any = {
            user_id: userId,
            attributes: mergedMetadata,
            silentUpdate: true,
        };

        console.log("📤 Sending setUserProperties body:", JSON.stringify(bodyData, null, 2));

        const response = await sendOrQueue({
            url: "https://users.appstorys.com/track-user",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${access_token}`,
            },
            body: bodyData,
        });
        console.log("📥 setUserProperties request queued or sent:", response);
    } catch (error) {
        console.error("❌ Error in setUserProperties:", error);
    }
};
