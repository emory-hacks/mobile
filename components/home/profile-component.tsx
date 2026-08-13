import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { DefaultPfp } from "@/components/home/default-pfp";

type ProfileComponentProps = {
  name: string;
  onSettingsPress?: () => void;
  teamName: string;
};

export function ProfileComponent({
  name,
  onSettingsPress,
  teamName,
}: ProfileComponentProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headingRow}>
          <Text style={styles.greeting}>Hello!</Text>
          <Pressable
            accessibilityLabel="Open settings"
            accessibilityRole="button"
            hitSlop={12}
            onPress={onSettingsPress}
            style={styles.settingsButton}
          >
            <Ionicons color="#111111" name="settings-outline" size={26} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.copy}>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.teamPill}>
              <Text style={styles.teamText}>{teamName}</Text>
            </View>
          </View>

          <DefaultPfp
            accessibilityLabel={`${name}'s profile picture`}
            size={66}
            style={styles.avatar}
          />
        </View>
      </View>

      <LinearGradient
        colors={[
          "rgba(0, 0, 0, 0.16)",
          "rgba(0, 0, 0, 0.08)",
          "rgba(0, 0, 0, 0)",
        ]}
        pointerEvents="none"
        style={styles.bottomShadow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    transform: [{ translateY: 8 }],
  },
  bottomShadow: {
    bottom: -14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    height: 28,
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 0,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 32,
    paddingHorizontal: 32,
    paddingTop: 31,
    zIndex: 1,
  },
  container: {
    position: "relative",
    zIndex: 1,
  },
  content: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  copy: {
    alignItems: "flex-start",
    flex: 1,
    paddingRight: 20,
  },
  greeting: {
    color: "#9BD31B",
    fontFamily: "Grandstander_900Black",
    fontSize: 40,
    lineHeight: 44,
  },
  headingRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: {
    color: "#080808",
    fontFamily: "Grandstander_900Black",
    fontSize: 22,
    lineHeight: 27,
  },
  settingsButton: {
    alignItems: "center",
    height: 26,
    justifyContent: "center",
    width: 26,
  },
  teamPill: {
    backgroundColor: "#9BD31B",
    borderRadius: 16,
    marginTop: 18,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  teamText: {
    color: "#FFFFFF",
    fontFamily: "AlanSans_500Medium",
    fontSize: 13,
    lineHeight: 16,
  },
});
