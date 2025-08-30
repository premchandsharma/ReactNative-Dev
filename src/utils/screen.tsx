import EncryptedStorage from "react-native-encrypted-storage";
import WebSocketClient from "./websocket";

let client: WebSocketClient | null = null;

export const trackScreen = async (user_id: string, screenName: string): Promise<any[]> => {
  return new Promise(async (resolve) => {
    try {
      const access_token = await EncryptedStorage.getItem('access_token');
      if (!access_token) {
        console.error('Access token not found');
        return resolve([]);
      }
      const response = await fetch('https://users.appstorys.com/track-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify({
          user_id,
          screenName,
          attributes: {}
        }),
      });

      // Check if response is OK before parsing
      if (!response.ok) {
        // console.error('API response not OK:', response.status, response.statusText);
        return resolve([]);
      }

      const data = await response.json();

      client?.disconnect();
      client = new WebSocketClient();
      client.connect(data.ws);
      client.onMessage((message: string) => {
        try {
          const parsedMessage = JSON.parse(message);
          if (parsedMessage.campaigns) {
            client?.disconnect();
            // console.log('Campaigns received:', parsedMessage.campaigns);
            resolve(parsedMessage.campaigns);
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
