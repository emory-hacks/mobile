import { Fredoka_700Bold, useFonts } from "@expo-google-fonts/fredoka";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import * as Brightness from "expo-brightness";
import { useCallback, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function QRCodeScreen() {
  const originalBrightness = useRef<number | null>(null);
  const isAdmin = true;
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [searchQuery, setSearchQuery] = useState("");
  const [scanned, setScanned] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [fontsLoaded] = useFonts({
    Fredoka_700Bold,
  });

  useFocusEffect(
    useCallback(() => {
      if (isAdmin) {
        setScanned(false);
        return;
      }

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
    }, [isAdmin]),
  );

  const handleBarcodeScanned = useCallback((result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    // TODO: handle scanned QR data (e.g. look up attendee)
    console.log("Scanned QR:", result.data);
  }, [scanned]);

  const handleStartCamera = useCallback(async () => {
    if (cameraActive && permission?.granted) return;

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }

    setCameraActive(true);
  }, [cameraActive, permission?.granted, requestPermission]);

  if (isAdmin) {
    const cameraReady = cameraActive && permission?.granted && isFocused;

    return (
      <View style={styles.adminContainer}>
        <View
          style={[
            styles.adminHeader,
            { paddingTop: Math.max(insets.top, 16) + 8 },
          ]}
        >
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.scanTitle,
                fontsLoaded && { fontFamily: "Fredoka_700Bold" },
              ]}
            >
              Scan
            </Text>
            <Pressable
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Settings"
              style={({ pressed, hovered }) => [
                styles.settingsButton,
                (pressed || hovered) && styles.settingsButtonActive,
              ]}
            >
              {({ pressed, hovered }) => (
                <Ionicons
                  name="settings-outline"
                  size={26}
                  color={pressed || hovered ? "#000" : "#333"}
                />
              )}
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="@name"
              placeholderTextColor="#9a9a9a"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable
              style={({ pressed, hovered }) => [
                styles.searchButton,
                (pressed || hovered) && styles.searchButtonActive,
              ]}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Search"
            >
              {({ pressed, hovered }) => (
                <Ionicons
                  name="search"
                  size={22}
                  color={pressed || hovered ? "#333" : "#5a5a5a"}
                />
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.scannerSection}>
          <View style={styles.scannerViewport}>
            {cameraReady ? (
              <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              />
            ) : (
              <View style={styles.scannerPlaceholder} />
            )}

            <Pressable
              style={styles.crosshair}
              onPress={handleStartCamera}
              disabled={cameraReady}
              pointerEvents={cameraReady ? "none" : "auto"}
              accessibilityRole="button"
              accessibilityLabel="Start camera"
            >
              <View style={styles.crosshairHorizontal} />
              <View style={styles.crosshairVertical} />
            </Pressable>
          </View>

          <Text style={styles.instructionText}>
            Please scan the{" "}
            <Text style={styles.instructionHighlight}>QR code</Text> with your
            camera.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View
        style={{ alignItems: "center", paddingTop: 100, paddingBottom: 20 }}
      >
        <Text
          style={{
            color: "black",
            fontSize: 25,
          }}
        >
          {" "}
          {/* (This is a placeholder, we need to figure out how to generate the QR code for each user) */}
          Your Unique QR Code
        </Text>
      </View>
      <View
        style={{ flex: 0.8, alignItems: "center", justifyContent: "center" }}
      >
        <View
          style={{ backgroundColor: "white", padding: 10, borderRadius: 10 }}
        >
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

const styles = StyleSheet.create({
  adminContainer: {
    flex: 1,
    backgroundColor: "#ececec",
  },
  adminHeader: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 22,
    paddingBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scanTitle: {
    fontSize: 42,
    fontWeight: "700",
    color: "#A3CE26",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: "#efefef",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
  },
  settingsButton: {
    padding: 4,
    borderRadius: 8,
  },
  settingsButtonActive: {
    backgroundColor: "#e8e8e8",
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: "#efefef",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonActive: {
    backgroundColor: "#d8d8d8",
  },
  scannerSection: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: "center",
  },
  scannerViewport: {
    flex: 1,
    width: "100%",
    maxHeight: 520,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#f2f2f2",
  },
  scannerPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#f2f2f2",
  },
  crosshair: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  crosshairHorizontal: {
    position: "absolute",
    width: 28,
    height: 1.5,
    backgroundColor: "#b0b0b0",
    borderRadius: 1,
  },
  crosshairVertical: {
    position: "absolute",
    width: 1.5,
    height: 28,
    backgroundColor: "#b0b0b0",
    borderRadius: 1,
  },
  instructionText: {
    marginTop: 20,
    fontSize: 16,
    color: "#111",
    textAlign: "center",
  },
  instructionHighlight: {
    color: "#A3CE26",
    fontWeight: "600",
  },
});
