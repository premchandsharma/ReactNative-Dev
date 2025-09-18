import {create} from "zustand/react";
import {AppStorysActions, AppStorysStore} from "./types";
import EncryptedStorage from "react-native-encrypted-storage";

const useAppStorysStore = create<AppStorysStore & AppStorysActions>((set) => ({
  campaigns: [],
  userId: '',
  appId: '',
  accountId: '',
  trackedEvents: [],
  setCampaigns: (campaigns) => set({campaigns}),
  setUserId: (userId) => set({userId}),
  setAppId: (appId) => set({appId}),
  setAccountId: (accountId) => set({accountId}),
  setAttributes: (attributes) => set({attributes}),
  setScreenOptions: (screenOptions) => set({screenOptions}),
  setTrackedEvents: (trackedEvents) => set({trackedEvents}),
}));

export function getAppId() {
  return useAppStorysStore.getState().appId;
}

export function getUserId() {
  return useAppStorysStore.getState().userId;
}

export async function getAccessToken() {
  return EncryptedStorage.getItem('access_token');
}

export function getCampaigns() {
  return useAppStorysStore.getState().campaigns;
}

export function getAttributes() {
  return useAppStorysStore.getState().attributes;
}


export default useAppStorysStore;
