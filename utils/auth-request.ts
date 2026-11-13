import { Platform } from "react-native";

type AuthRequest = {
  credentials: "include" | "omit";
  headers?: Record<string, string>;
};

export function authRequest(jwt: string): AuthRequest {
  if (Platform.OS === "web") {
    return {
      credentials: "include",
    };
  }

  return {
    credentials: "omit",
    headers: {
      Cookie: `token=${jwt}`,
    },
  };
}
