import { API_BASE_URL } from "@/constants/computer-ip";
import { getJwt, getRole } from "@/utils/auth-token";
import { Fredoka_700Bold, useFonts } from "@expo-google-fonts/fredoka";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import * as Brightness from "expo-brightness";
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import { fetch } from "expo/fetch";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function QRCodeScreen() {
  const originalBrightness = useRef<number | null>(null);
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [searchQuery, setSearchQuery] = useState("");
  const [scanned, setScanned] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [fontsLoaded] = useFonts({
    Fredoka_700Bold,
  });
  const [qrCode, setQrCode] = useState("");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(false);

  useEffect(() => {
    (async () => {
      const role = await getRole();
      setIsAdmin(!!role && role.includes("admin"));
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isAdmin !== false) {
        if (isAdmin) setScanned(false);
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

      (async () => {
        const jwt = await getJwt();
        const response = await fetch(`${API_BASE_URL}/api/users/me/qr`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Cookie: `token=${jwt}`,
          },
        });
        if (!response.ok) {
          console.log(response);
          return;
        }

        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUri = reader.result as string;
          setQrCode(dataUri);
        };
        reader.readAsDataURL(blob);
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

  const handleSearchUser = async () => {
    const jwt = await getJwt();
    const response = await fetch(`${API_BASE_URL}/api/users/${searchQuery}`, {
      method: "GET",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${jwt}`,
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        Alert.alert("User not found");
        return;
      }
      console.log(response.status, await response.text());
      return;
    }
    console.log("success!", await response.json());
  };

  const handleBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (scanned) return;
      setScanned(true);

      (async () => {
        try {
          await fetch(`${API_BASE_URL}/api/admin/award-points-fast`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: result.data,
              amount: 1,
              eventId: "temp",
            }),
          });
          await console.log(result.data);
        } catch {
          // request failed
          console.log("Scanning failed");
        }
      })();
    },
    [scanned],
  );

  const handleStartCamera = useCallback(async () => {
    if (cameraActive && permission?.granted) return;

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }

    setCameraActive(true);
  }, [cameraActive, permission?.granted, requestPermission]);

  const handleDismissScanResult = useCallback(() => {
    setScanned(false);
  }, []);

  if (isAdmin === null) {
    return <View style={styles.pageContainer} />;
  }

  if (isAdmin) {
    const cameraReady = cameraActive && permission?.granted && isFocused;

    // Placeholder attendee data until QR lookup is wired up
    const scannedAttendee = {
      username: "@Name",
      teamName: "Team Name",
      points: 72,
      maxPoints: 100,
      checkInValid: true,
      email: "jyweva@ewha.ac.kr",
    };
    const progress = Math.min(
      scannedAttendee.points / scannedAttendee.maxPoints,
      1.0,
    );

    return (
      <View style={styles.pageContainer}>
        <View
          style={[
            styles.pageHeader,
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
              onPress={handleSearchUser}
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

        {scanned ? (
          <View style={styles.profileSection}>
            <View style={styles.profileTopRow}>
              <Pressable
                onPress={handleDismissScanResult}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Back to scanner"
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={28} color="#111" />
              </Pressable>
              <View style={styles.profileAvatar} />
            </View>

            <View style={styles.profileIdentity}>
              <View style={styles.usernameRow}>
                <Text style={styles.username}>{scannedAttendee.username}</Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              </View>
              <View style={styles.teamBadge}>
                <Text style={styles.teamBadgeText}>
                  {scannedAttendee.teamName}
                </Text>
              </View>
            </View>

            <View style={styles.pointsRow}>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsBadgeText}>
                  {scannedAttendee.points} points
                </Text>
              </View>
              <View style={styles.progressColumn}>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressLabelMuted}>0</Text>
                  <Text
                    style={[
                      styles.progressLabelCurrent,
                      { left: `${progress * 100}%` },
                    ]}
                  >
                    {scannedAttendee.points}
                  </Text>
                  <Text style={styles.progressLabelMuted}>
                    {scannedAttendee.maxPoints}
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress * 100}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.progressThumb,
                      { left: `${progress * 100}%` },
                    ]}
                  />
                </View>
              </View>
            </View>

            <View style={styles.detailList}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Check in</Text>
                <View style={styles.validBadge}>
                  <Text style={styles.validBadgeText}>
                    {scannedAttendee.checkInValid ? "Valid" : "Invalid"}
                  </Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{scannedAttendee.email}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.scannerSection}>
            <View style={styles.scannerViewport}>
              {cameraReady ? (
                <CameraView
                  style={StyleSheet.absoluteFillObject}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                  onBarcodeScanned={handleBarcodeScanned}
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
        )}
      </View>
    );
  }

  return (
    <View style={styles.pageContainer}>
      <View
        style={[
          styles.pageHeader,
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
            Show
          </Text>
        </View>
      </View>
      <View
        style={{ flex: 0.9, alignItems: "center", justifyContent: "center" }}
      >
        <View>
          {qrCode ? (
            <Image
              source={{ uri: qrCode }}
              style={{ width: 300, height: 300, borderRadius: 10 }}
            />
          ) : null}
        </View>
        <Text style={styles.instructionText}>
          Please show your{" "}
          <Text style={styles.instructionHighlight}>QR code</Text> to an
          organizer
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#ececec",
  },
  pageHeader: {
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
    marginLeft: 5,
    marginRight: 5,
  },
  instructionHighlight: {
    color: "#A3CE26",
    fontWeight: "600",
  },
  profileSection: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 16,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 24,
  },
  profileTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  backButton: {
    paddingTop: 4,
  },
  profileAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#A3CE26",
  },
  profileIdentity: {
    marginTop: -20,
    gap: 10,
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  username: {
    fontSize: 36,
    fontWeight: "700",
    color: "#111",
  },
  verifiedBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#A3CE26",
    alignItems: "center",
    justifyContent: "center",
  },
  teamBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#A3CE26",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  teamBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 28,
    gap: 16,
  },
  pointsBadge: {
    backgroundColor: "#A3CE26",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  pointsBadgeText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  progressColumn: {
    flex: 1,
    paddingTop: 4,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    position: "relative",
    height: 16,
  },
  progressLabelMuted: {
    fontSize: 12,
    color: "#c0c0c0",
  },
  progressLabelCurrent: {
    position: "absolute",
    fontSize: 12,
    color: "#A3CE26",
    fontWeight: "600",
    transform: [{ translateX: -8 }],
  },
  progressTrack: {
    height: 3,
    backgroundColor: "#111",
    borderRadius: 2,
    justifyContent: "center",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#A3CE26",
    borderRadius: 2,
  },
  progressThumb: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#A3CE26",
    marginLeft: -7,
  },
  detailList: {
    marginTop: 36,
    gap: 22,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  detailValue: {
    fontSize: 15,
    color: "#b0b0b0",
  },
  validBadge: {
    backgroundColor: "#A3CE26",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  validBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
