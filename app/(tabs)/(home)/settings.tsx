import { DefaultPfp } from "@/components/home/default-pfp";
import { API_BASE_URL } from "@/constants/computer-ip";
import { authRequest } from "@/utils/auth-request";
import {
  AlanSans_400Regular,
  AlanSans_500Medium,
  AlanSans_700Bold,
} from "@expo-google-fonts/alan-sans";
import { Grandstander_900Black } from "@expo-google-fonts/grandstander";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFonts } from "expo-font";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { fetch } from "expo/fetch";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  clearEmail,
  clearJwt,
  clearRole,
  getEmail,
  getJwt,
  getRole,
} from "../../../utils/auth-token";
import { getInfo } from "../../../utils/user-info";

function paramValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function showMessage(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }

  Alert.alert(title, message);
}

export default function SettingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name?: string;
    email?: string;
    teamName?: string;
    points?: string;
    checkedIn?: string;
    fromScan?: string;
    role?: string;
  }>();
  const fromScan = paramValue(params.fromScan) === "1";

  const [fontsLoaded] = useFonts({
    AlanSans_400Regular,
    AlanSans_500Medium,
    AlanSans_700Bold,
    Grandstander_900Black,
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [teamName, setTeamName] = useState("");
  const [points, setPoints] = useState("0");
  const [checkedIn, setCheckedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (fromScan) {
        setIsAdmin(paramValue(params.role).toLowerCase().includes("admin"));
        return;
      }

      let active = true;
      (async () => {
        const role = await getRole();
        if (active) {
          setIsAdmin(role?.toLowerCase().includes("admin") ?? false);
        }
      })();

      return () => {
        active = false;
      };
    }, [fromScan, params.role]),
  );

  useEffect(() => {
    if (fromScan) {
      setName(paramValue(params.name));
      setEmail(paramValue(params.email));
      setTeamName(paramValue(params.teamName));
      setPoints(paramValue(params.points) || "0");
      setCheckedIn(paramValue(params.checkedIn) === "true");
      return;
    }

    (async () => {
      setName((await getInfo("name")) ?? "");
      setEmail((await getEmail()) ?? "");
      setTeamName((await getInfo("teamName")) ?? "");
      setPoints((await getInfo("points")) ?? "0");
      setCheckedIn((await getInfo("checkedIn")) === "true");
    })();
  }, [
    fromScan,
    params.name,
    params.email,
    params.teamName,
    params.points,
    params.checkedIn,
  ]);

  const performLogout = async () => {
    await clearJwt();
    await clearEmail();
    await clearRole();
    router.replace("/login");
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to log out?")) {
        void performLogout();
      }
      return;
    }

    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => void performLogout(),
      },
    ]);
  };

  const performDeleteAccount = async () => {
    const jwt = await getJwt();
    const accountEmail = email || (await getEmail());

    if (!jwt || !accountEmail) {
      showMessage(
        "Delete account",
        "Could not find your account. Try logging in again.",
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/${encodeURIComponent(accountEmail)}`,
        {
          method: "DELETE",
          ...authRequest(jwt),
        },
      );

      if (!response.ok) {
        showMessage(
          "Delete account",
          "Could not delete your account. Please try again.",
        );
        return;
      }

      await performLogout();
    } catch {
      showMessage(
        "Delete account",
        "Could not connect to the server. Please try again.",
      );
    }
  };

  const handleDeleteAccount = () => {
    const message =
      "This permanently deletes your account. This cannot be undone.";

    if (Platform.OS === "web") {
      if (window.confirm(message)) {
        void performDeleteAccount();
      }
      return;
    }

    Alert.alert(
      "Delete account",
      message,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void performDeleteAccount(),
        },
      ],
    );
  };

  if (!fontsLoaded) {
    return <View style={styles.screen} />;
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.identity}>
            <View style={styles.nameWrap}>
              {name
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .map((word, i, words) => (
                  <Text
                    key={`${word}-${i}`}
                    numberOfLines={1}
                    style={styles.name}
                  >
                    {word}
                    {i < words.length - 1 ? " " : ""}
                  </Text>
                ))}
            </View>
            <Text style={styles.profileLabel}>Profile</Text>
          </View>

          <View style={styles.profileActions}>
            {!fromScan ? (
              <Pressable
                accessibilityLabel="Log out"
                accessibilityRole="button"
                hitSlop={8}
                onPress={handleLogout}
                style={({ pressed }) => [
                  styles.logoutButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.logoutText}>LOGOUT</Text>
              </Pressable>
            ) : null}

            <DefaultPfp
              accessibilityLabel="Profile picture"
              size={112}
              isAdmin={isAdmin}
            />
          </View>
        </View>

        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons color="#111111" name="arrow-back" size={32} />
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          <InfoRow label="Email" value={email} />
        </View>

        <View style={[styles.section, styles.activitySection]}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <InfoRow label="Points" value={points} />
          {/* <InfoRow label="Team" pill value={teamName} /> */}
          <InfoRow
            label="Check in"
            pill
            pillColor={checkedIn ? undefined : "#E53935"}
            value={checkedIn ? "Valid" : "Invalid"}
          />
          {!checkedIn && (
            <Text style={styles.registerInfoText}>
              In order to check in, you need to get scanned onsite. Visit the
              events tab for more information.
            </Text>
          )}
        </View>

        {!fromScan ? (
          <Pressable
            accessibilityLabel="Delete account"
            accessibilityRole="button"
            hitSlop={8}
            onPress={handleDeleteAccount}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.deleteText}>DELETE ACCOUNT</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

type InfoRowProps = {
  label: string;
  pill?: boolean;
  pillColor?: string;
  value: string;
};

function InfoRow({ label, pill = false, pillColor, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {pill ? (
        <View
          style={[
            styles.pill,
            pillColor ? { backgroundColor: pillColor } : null,
          ]}
        >
          <Text style={styles.pillText}>{value}</Text>
        </View>
      ) : (
        <Text numberOfLines={1} style={styles.infoValue}>
          {value}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  activitySection: {
    marginTop: 34,
  },
  backButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    marginTop: 38,
    marginLeft: -10,
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 26,
  },
  deleteButton: {
    marginTop: 40,
  },
  deleteText: {
    color: "#E53935",
    fontFamily: "AlanSans_500Medium",
    fontSize: 13,
  },
  identity: {
    flex: 1,
    paddingRight: 20,
    paddingTop: 10,
  },
  infoLabel: {
    color: "#111111",
    fontFamily: "AlanSans_700Bold",
    fontSize: 16,
  },
  infoRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 36,
  },
  infoValue: {
    color: "#A9A9A9",
    flexShrink: 1,
    fontFamily: "AlanSans_400Regular",
    fontSize: 16,
    marginLeft: 24,
    textAlign: "right",
  },
  logoutButton: {
    alignItems: "flex-end",
    height: 44,
    justifyContent: "center",
  },
  logoutText: {
    color: "#999999",
    fontFamily: "AlanSans_500Medium",
    fontSize: 13,
  },
  name: {
    color: "#9BD31B",
    fontFamily: "Grandstander_900Black",
    fontSize: 36,
    lineHeight: 44,
  },
  nameWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    maxHeight: 132,
    overflow: "hidden",
  },
  pill: {
    backgroundColor: "#9BD31B",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: {
    color: "#FFFFFF",
    fontFamily: "AlanSans_500Medium",
    fontSize: 13,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.55,
  },
  profileActions: {
    alignItems: "flex-end",
  },
  profileHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  profileLabel: {
    color: "#080808",
    fontFamily: "Grandstander_900Black",
    fontSize: 22,
    lineHeight: 27,
  },
  registerInfoText: {
    color: "red",
    marginTop: 15,
    marginBottom: 15,
  },
  screen: {
    backgroundColor: "#EDF3F7",
    flex: 1,
  },
  section: {
    gap: 2,
    marginTop: 30,
  },
  sectionTitle: {
    color: "#111111",
    fontFamily: "AlanSans_700Bold",
    fontSize: 26,
    lineHeight: 32,
    marginBottom: 16,
  },
});
