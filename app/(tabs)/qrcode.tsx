import { useFocusEffect } from "@react-navigation/native";
import * as Brightness from "expo-brightness";
import { useCallback, useRef } from "react";
import { Text, View, useColorScheme } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function QRCodeScreen() {
  let colorScheme = useColorScheme();
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
    <View style={{ flex: 1 }}>
      <View style={{ alignItems: "center", padding: 45 }}>
        <Text
          style={{
            color: colorScheme === "dark" ? "white" : "black",
            fontSize: 25,
          }}
        > {/* (This is a placeholder, we need to figure out how to generate the QR code for each user) */}
          Show your QR
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
