import { Platform } from "react-native";

export const API_BASE_URL =
  Platform.OS === "web" ? "/backend" : "https://api-gdff.onrender.com";
