import {
  AlanSans_400Regular,
  AlanSans_500Medium,
  AlanSans_700Bold,
} from "@expo-google-fonts/alan-sans";
import { Grandstander_900Black } from "@expo-google-fonts/grandstander";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { clearJwt } from "../../../utils/auth-token";

export default function SettingsScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    AlanSans_400Regular,
    AlanSans_500Medium,
    AlanSans_700Bold,
    Grandstander_900Black,
  });

  if (!fontsLoaded) {
    return <View style={styles.screen} />;
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.identity}>
            <Text style={styles.name}>Taeeun K.</Text>
            <Text style={styles.profileLabel}>Profile</Text>
          </View>

          <View style={styles.profileActions}>
            <Pressable
              accessibilityLabel="Log out"
              accessibilityRole="button"
              hitSlop={8}
              onPress={async () => {
                await clearJwt();
                router.replace("/login");
              }}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.logoutText}>LOGOUT</Text>
            </Pressable>

            <View accessibilityLabel="Profile picture" style={styles.avatar}>
              <View style={styles.avatarHead} />
              <View style={styles.avatarBody} />
            </View>
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
          <InfoRow label="ID" value="@Name" />
          <InfoRow label="Email" value="jyweva@ewha.ac.kr" />
        </View>

        <View style={[styles.section, styles.activitySection]}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <InfoRow label="Team" pill value="Team Name" />
          <InfoRow label="Check in" pill value="Valid" />
        </View>
      </View>
    </SafeAreaView>
  );
}

type InfoRowProps = {
  label: string;
  pill?: boolean;
  value: string;
};

function InfoRow({ label, pill = false, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {pill ? (
        <View style={styles.pill}>
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
  avatar: {
    alignItems: "center",
    backgroundColor: "#A3CE26",
    borderRadius: 56,
    height: 112,
    justifyContent: "flex-end",
    overflow: "hidden",
    width: 112,
  },
  avatarBody: {
    backgroundColor: "#82BF78",
    borderRadius: 52,
    height: 62,
    marginBottom: -5,
    width: 104,
  },
  avatarHead: {
    backgroundColor: "#82BF78",
    borderRadius: 22,
    height: 44,
    marginBottom: -3,
    width: 44,
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
    fontSize: 40,
    lineHeight: 44,
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
  screen: {
    backgroundColor: "#FFFFFF",
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
