import CookieManager from "@preeternal/react-native-cookie-manager";
import Constants from "expo-constants";
import { Platform } from "react-native";

function getCookieUrl(): string {
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ?? Constants.expoConfig?.hostUri;

  if (debuggerHost) {
    const host = debuggerHost.split(":")[0];
    return `http://${host}`;
  }

  return "http://localhost";
}

export const addCookie = async () => {
  const url = getCookieUrl();
  const host = new URL(url).hostname;
  const cookie = {
    name: "token",
    value: "test",
    path: "/",
    domain: host,
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  };

  await CookieManager.set(url, cookie, false);

  if (Platform.OS === "ios") {
    await CookieManager.set(url, cookie, true);
  }
};
