import EncryptedStorage from "react-native-encrypted-storage";
import WebSocketClient from "./websocket";

let client: WebSocketClient | null = null;

export const trackScreen = async (user_id: string, screen_name: string): Promise<any[]> => {
  return new Promise(async (resolve) => {
    try {
      const access_token = await EncryptedStorage.getItem('access_token');
      if (!access_token) {
        console.error('Access token not found');
        return resolve([]);
      }
      console.log('trackScreen called with:', {user_id, screen_name, access_token});
      const response = await fetch('https://users.appstorys.com/track-user/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify({
          user_id,
          screen_name,
          attributes: {}
        }),
      });

      // Check if response is OK before parsing

      if (!response.ok) {
        console.error('API response not OK:', response.status, response.statusText);
        // Get response text first to debug
        const responseText = await response.text();
        console.error('Raw response text:', responseText, response.url);
        return resolve([]);
      }

      // Get response text first to debug
      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      console.log('trackScreen response status:', response.status);
      const data = await response.json();
      console.log('trackScreen response data:', data);

      client?.disconnect();
      client = new WebSocketClient();
      client.connect(data);
      client.onMessage((message: string) => {
        try {
          const parsedMessage = JSON.parse(message);
          // Assuming the message contains campaign data
          if (parsedMessage.campaign_type) {
            console.log('Received campaign data:', parsedMessage);
            resolve([parsedMessage]);
          }
        } catch (error) {
          resolve([]);
        }
      });
    } catch (error) {
      console.error('Error in trackScreen', error);
      resolve([]);
    }
  });
};
