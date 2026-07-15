import { useFocusEffect } from "@react-navigation/native";
import * as Brightness from "expo-brightness";
import { useCallback, useRef } from "react";
import { Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function QRCodeScreen() {
  const originalBrightness = useRef<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (active) {
          try {
            // Save the original brightness & set to MAX
            originalBrightness.current = await Brightness.getBrightnessAsync();
            await Brightness.setBrightnessAsync(1);
          } catch {
            // brightness control not available
          }
        }
      })();

      return () => {
        active = false;
        if (originalBrightness.current !== null) {
          try {
            Brightness.setBrightnessAsync(originalBrightness.current);
          } catch {
            // brightness control not available
          }
        }
      };
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ alignItems: "center", paddingTop: 100, paddingBottom: 20 }}>
        <Text
          style={{
            color: "black",
            fontSize: 25,
          }}
        > {/* (This is a placeholder, we need to figure out how to generate the QR code for each user) */}
          Your Unique QR Code
        </Text>
      </View>
      <View
        style={{ flex: 0.8, alignItems: "center", justifyContent: "center" }}
      >
        <View style={{ backgroundColor: "white", padding: 10, borderRadius: 10 }}>
          <QRCode
            value="https://expo.dev"
            size={200}
            color="black"
            backgroundColor="white"
          />
        </View>
      </View>
    </View>
  );
}
