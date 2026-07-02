import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  TOKEN_COOKIE_NAME,
  TOKEN_COOKIE_VALUE,
} from "./login-cookie.constants";

export const addCookie = async () => {
  await AsyncStorage.setItem(TOKEN_COOKIE_NAME, TOKEN_COOKIE_VALUE);
};

export const hasValidToken = async (): Promise<boolean> => {
  const value = await AsyncStorage.getItem(TOKEN_COOKIE_NAME);
  return value === TOKEN_COOKIE_VALUE;
};
