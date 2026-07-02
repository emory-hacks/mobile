import * as SecureStore from "expo-secure-store";

import {
  TOKEN_COOKIE_NAME,
  TOKEN_COOKIE_VALUE,
} from "./login-cookie.constants";

export const addCookie = async () => {
  await SecureStore.setItemAsync(TOKEN_COOKIE_NAME, TOKEN_COOKIE_VALUE);
};

export const hasValidToken = async (): Promise<boolean> => {
  const value = await SecureStore.getItemAsync(TOKEN_COOKIE_NAME);
  return value === TOKEN_COOKIE_VALUE;
};
