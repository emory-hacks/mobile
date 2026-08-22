import { API_BASE_URL } from "@/constants/computer-ip";
import { getUpcomingEvents } from "@/services/schedule";
import type { ScheduleEvent } from "@/types/schedule-event";
import { getJwt, getRole } from "@/utils/auth-token";
import { Fredoka_700Bold, useFonts } from "@expo-google-fonts/fredoka";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { Buffer } from "buffer";
import * as Brightness from "expo-brightness";
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import { fetch } from "expo/fetch";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScannedAttendee = {
  username: string;
  teamName: string;
  points: number;
  maxPoints: number;
  checkInValid: boolean;
  email: string;
};

function formatUsername(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "@Name";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

const AWARD_AMOUNTS = [0, 5] as const;
type AwardAmount = (typeof AWARD_AMOUNTS)[number];

function eventKey(event: ScheduleEvent) {
  return event.title.trim();
}

const ORIGINAL_BRIGHTNESS_KEY = "originalBrightness";

export default function QRCodeScreen() {
  const scanLock = useRef(false);
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [searchQuery, setSearchQuery] = useState("");
  const [scanned, setScanned] = useState(false);
  const [scannedAttendee, setScannedAttendee] =
    useState<ScannedAttendee | null>(null);
  const [isLoadingScan, setIsLoadingScan] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [fontsLoaded] = useFonts({
    Fredoka_700Bold,
  });
  const [qrCode, setQrCode] = useState("");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(false);
  const [upcomingEvents, setUpcomingEvents] = useState<ScheduleEvent[]>([]);
  const [eventId, setEventId] = useState("");
  const [awardAmount, setAwardAmount] = useState<AwardAmount>(5);
  const eventIdRef = useRef(eventId);
  const awardAmountRef = useRef(awardAmount);

  useEffect(() => {
    eventIdRef.current = eventId;
  }, [eventId]);

  useEffect(() => {
    awardAmountRef.current = awardAmount;
  }, [awardAmount]);

  useEffect(() => {
    (async () => {
      const role = await getRole();
      setIsAdmin(!!role && role.includes("admin"));
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const current = await Brightness.getBrightnessAsync();
          await AsyncStorage.setItem(ORIGINAL_BRIGHTNESS_KEY, String(current));
          await Brightness.setBrightnessAsync(1);
        } catch {
          // brightness control not available
        }
      })();

      return () => {
        (async () => {
          try {
            const saved = await AsyncStorage.getItem(ORIGINAL_BRIGHTNESS_KEY);
            if (saved != null) {
              await Brightness.setBrightnessAsync(Number(saved));
            }
          } catch {
            // brightness control not available
          }
        })();
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (isAdmin !== false) {
        if (isAdmin) {
          setScanned(false);
          setScannedAttendee(null);
          setIsLoadingScan(false);
          scanLock.current = false;

          (async () => {
            try {
              const events = await getUpcomingEvents();
              setUpcomingEvents(events);
              setEventId((prev) => {
                if (prev && events.some((event) => eventKey(event) === prev)) {
                  return prev;
                }
                return events[0] ? eventKey(events[0]) : "";
              });
            } catch (error) {
              console.log("Failed to load upcoming events", error);
              setUpcomingEvents([]);
            }
          })();
        }
        return;
      }

      let active = true;
      (async () => {
        try {
          const jwt = await getJwt();
          if (!jwt) return;

          // Use expo/fetch + credentials: "omit" so manual Cookie header is sent.
          const response = await fetch(`${API_BASE_URL}/api/users/me/qr`, {
            method: "GET",
            credentials: "omit",
            headers: {
              "Content-Type": "application/json",
              Cookie: `token=${jwt}`,
            },
          });

          if (!response.ok) {
            console.log(response.status, await response.text());
            return;
          }

          const contentType =
            response.headers.get("content-type") ?? "image/png";
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString("base64");
          if (active) {
            setQrCode(`data:${contentType};base64,${base64}`);
          }
        } catch (error) {
          console.log("Failed to load QR code", error);
        }
      })();

      return () => {
        active = false;
      };
    }, [isAdmin]),
  );

  const handleSearchUser = async () => {
    const query = searchQuery.trim();
    if (!query) {
      Alert.alert("Enter an email to search");
      return;
    }

    const selectedEventId = eventId.trim();
    if (!selectedEventId) {
      Alert.alert(
        "Select an event",
        "Choose which upcoming event this check-in is for.",
      );
      return;
    }

    setScanned(false);
    setScannedAttendee(null);
    setIsLoadingScan(true);

    const jwt = await getJwt();
    if (!jwt) {
      Alert.alert("Search failed", "Not authenticated.");
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/users/${encodeURIComponent(query)}`,
      {
        method: "GET",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${jwt}`,
        },
      },
    );
    if (!response.ok) {
      if (response.status === 404) {
        Alert.alert("User not found");
        setIsLoadingScan(false);
        return;
      }
      console.log(response.status, await response.text());
      Alert.alert("Search failed", "Could not load user profile.");
      setIsLoadingScan(false);
      return;
    }

    const userData = await response.json();
    const userEmail = String(userData.email ?? query);
    let points = Number(userData.points ?? 0);

    const awardResponse = await fetch(
      `${API_BASE_URL}/api/admin/award-points-search`,
      {
        method: "POST",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${jwt}`,
        },
        body: JSON.stringify({
          email: userEmail,
          amount: awardAmount,
          eventId: selectedEventId,
        }),
      },
    );

    if (!awardResponse.ok) {
      console.log(awardResponse.status, await awardResponse.text());
      if (awardResponse.status === 409) {
        Alert.alert(
          "Already awarded",
          "This attendee already received points for this event.",
        );
      } else {
        Alert.alert("Search failed", "Could not award points.");
      }
    } else {
      const awardData = (await awardResponse.json()) as {
        newBalance?: unknown;
      };
      points = Number(awardData.newBalance ?? points + awardAmount);
    }

    setScannedAttendee({
      username: formatUsername(userData.name ?? query),
      teamName: userData.teamName ?? "",
      points,
      maxPoints: userData.maxPoints ?? 100,
      checkInValid: !!userData.checkedIn,
      email: userEmail,
    });
    setScanned(true);
    setIsLoadingScan(false);
  };

  const handleBarcodeScanned = useCallback((result: BarcodeScanningResult) => {
    if (scanLock.current) return;
    scanLock.current = true;
    setIsLoadingScan(true);

    const resetAfterAlert = () => {
      scanLock.current = false;
      setCameraActive(true);
    };

    const showScanFailure = (message: string) => {
      setIsLoadingScan(false);
      setCameraActive(false);
      Alert.alert("Scan failed", message, [
        {
          text: "OK",
          onPress: resetAfterAlert,
        },
      ]);
    };

    (async () => {
      try {
        const jwt = await getJwt();
        if (!jwt) {
          showScanFailure("Not authenticated.");
          return;
        }

        const selectedEventId = eventIdRef.current.trim();
        if (!selectedEventId) {
          showScanFailure("Choose which upcoming event this check-in is for.");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/admin/award-points-fast`,
          {
            method: "POST",
            credentials: "omit",
            headers: {
              "Content-Type": "application/json",
              Cookie: `token=${jwt}`,
            },
            body: JSON.stringify({
              token: result.data,
              amount: awardAmountRef.current,
              eventId: selectedEventId,
            }),
          },
        );

        if (!response.ok) {
          console.log(response.status, await response.text());
          if (response.status === 409) {
            showScanFailure(
              "This attendee already received points for this event.",
            );
            return;
          }
          showScanFailure("Could not award points.");
          return;
        }

        const data = (await response.json()) as Record<string, unknown>;
        console.log(data);

        const userEmail =
          typeof data.user === "string"
            ? data.user
            : String(
                (data.user as Record<string, unknown> | undefined)?.email ?? "",
              );

        if (!userEmail) {
          showScanFailure("Could not load user profile.");
          return;
        }

        const userResponse = await fetch(
          `${API_BASE_URL}/api/users/${encodeURIComponent(userEmail)}`,
          {
            method: "GET",
            credentials: "omit",
            headers: {
              "Content-Type": "application/json",
              Cookie: `token=${jwt}`,
            },
          },
        );

        if (!userResponse.ok) {
          console.log(userResponse.status, await userResponse.text());
          showScanFailure("Could not load user profile.");
          return;
        }

        const userData = (await userResponse.json()) as Record<string, unknown>;
        const displayEmail = String(userData.email ?? userEmail);
        setScannedAttendee({
          username: formatUsername(String(userData.name ?? displayEmail)),
          teamName: String(userData.teamName ?? ""),
          points: Number(data.newBalance ?? userData.points ?? 0),
          maxPoints: Number(userData.maxPoints ?? 100),
          checkInValid: !!userData.checkedIn,
          email: displayEmail,
        });
        setIsLoadingScan(false);
        setCameraActive(false);
        setScanned(true);
        scanLock.current = false;
      } catch (error) {
        console.log("Scanning failed", error);
        showScanFailure("Something went wrong.");
      }
    })();
  }, []);

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
    setScannedAttendee(null);
  }, []);

  if (isAdmin === null) {
    return <View style={styles.pageContainer} />;
  }

  if (isAdmin) {
    const cameraReady = cameraActive && permission?.granted && isFocused;
    const attendee = scannedAttendee;
    const progress =
      attendee && attendee.maxPoints > 0
        ? Math.min(attendee.points / attendee.maxPoints, 1.0)
        : 0;

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

          {upcomingEvents.length > 0 ? (
            <View style={styles.selectorRow}>
              {upcomingEvents.map((event) => {
                const id = eventKey(event);
                const selected = eventId === id;
                return (
                  <Pressable
                    key={`${event.startTime}-${id}`}
                    style={({ pressed }) => [
                      styles.selectorButton,
                      selected && styles.selectorButtonSelected,
                      pressed && styles.selectorButtonPressed,
                    ]}
                    onPress={() => setEventId(id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`Select event ${event.title}`}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.selectorButtonText,
                        selected && styles.selectorButtonTextSelected,
                      ]}
                    >
                      {event.title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Text style={styles.selectorEmptyText}>
              No events in the next 30 minutes
            </Text>
          )}

          <View style={styles.selectorRow}>
            {AWARD_AMOUNTS.map((amount) => {
              const selected = awardAmount === amount;
              return (
                <Pressable
                  key={amount}
                  style={({ pressed }) => [
                    styles.selectorButton,
                    selected && styles.selectorButtonSelected,
                    pressed && styles.selectorButtonPressed,
                  ]}
                  onPress={() => setAwardAmount(amount)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Award ${amount} points`}
                >
                  <Text
                    style={[
                      styles.selectorButtonText,
                      selected && styles.selectorButtonTextSelected,
                    ]}
                  >
                    {amount} pts
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {scanned && attendee ? (
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
            </View>

            <View style={styles.profileIdentity}>
              <View style={styles.usernameRow}>
                <Text style={styles.username}>{attendee.username}</Text>
              </View>
              {attendee.teamName ? (
                <View style={styles.teamBadge}>
                  <Text style={styles.teamBadgeText}>{attendee.teamName}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.pointsRow}>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsBadgeText}>
                  {attendee.points} points
                </Text>
              </View>
              <View style={styles.progressColumn}>
                <View style={styles.progressLabels}>
                  <View />
                  <View
                    style={[
                      styles.progressLabelCurrentWrap,
                      { left: `${progress * 100}%` },
                    ]}
                  >
                    <Text style={styles.progressLabelCurrent}>
                      {attendee.points}
                    </Text>
                  </View>
                  <Text style={styles.progressLabelMuted}>
                    {attendee.maxPoints}
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
                <View
                  style={[
                    styles.validBadge,
                    !attendee.checkInValid && styles.invalidBadge,
                  ]}
                >
                  <Text style={styles.validBadgeText}>
                    {attendee.checkInValid ? "Valid" : "Invalid"}
                  </Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{attendee.email}</Text>
              </View>
            </View>
          </View>
        ) : isLoadingScan ? (
          <View style={[styles.scannerSection, { justifyContent: "center" }]}>
            <ActivityIndicator size="large" color="#A3CE26" />
          </View>
        ) : (
          <View style={styles.scannerSection}>
            <View style={styles.scannerViewport}>
              {cameraReady ? (
                <CameraView
                  style={StyleSheet.absoluteFillObject}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                  onBarcodeScanned={
                    isLoadingScan ? undefined : handleBarcodeScanned
                  }
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
  selectorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  selectorButton: {
    flex: 1,
    minHeight: 40,
    backgroundColor: "#efefef",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  selectorButtonSelected: {
    backgroundColor: "#A3CE26",
  },
  selectorButtonPressed: {
    opacity: 0.85,
  },
  selectorButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5a5a5a",
    textAlign: "center",
  },
  selectorButtonTextSelected: {
    color: "#fff",
  },
  selectorEmptyText: {
    marginTop: 12,
    fontSize: 13,
    color: "#9a9a9a",
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
  profileIdentity: {
    marginTop: -0,
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
  progressLabelCurrentWrap: {
    position: "absolute",
    width: 0,
    alignItems: "center",
    overflow: "visible",
  },
  progressLabelCurrent: {
    fontSize: 12,
    color: "#A3CE26",
    fontWeight: "600",
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
  invalidBadge: {
    backgroundColor: "#E53935",
  },
  validBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
