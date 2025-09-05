import {Campaign} from "../../sdk/types";

export type TrackScreenResponse = {
  campaigns: Array<Campaign>;
  userId: string;
  message_id: string;
  metadata: {
    screen_capture_enabled: boolean;
    test_user: boolean;
  }
  test_user: boolean;
}

export type WebSocketClientConfig = {
  expires: number,
  sessionID: string,
  token: string,
  url: string
}

export type TrackScreenConfig = {
  screen_capture_enabled: boolean,
  test_user: boolean;
  userID: string;
  ws: WebSocketClientConfig
}
