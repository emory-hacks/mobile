import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
        <Pressable
          accessibilityLabel="Open settings"
          accessibilityRole="button"
          hitSlop={12}
          onPress={onSettingsPress}
          style={styles.settingsButton}
        >
          <Ionicons color="#111111" name="settings-outline" size={26} />
        </Pressable>

        <View style={styles.content}>
          <View style={styles.copy}>
            <Text style={styles.greeting}>Hello!</Text>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.teamPill}>
              <Text style={styles.teamText}>{teamName}</Text>
            </View>
          </View>

          <View
            accessibilityLabel={`${name}'s profile picture`}
            style={styles.avatar}
          >
            <View style={styles.avatarHead} />
            <View style={styles.avatarBody} />
          </View>
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
    alignItems: "center",
    backgroundColor: "#A3CE26",
    borderRadius: 33,
    height: 66,
    justifyContent: "flex-end",
    overflow: "hidden",
    transform: [{ translateY: 8 }],
    width: 66,
  },
  avatarBody: {
    backgroundColor: "#82BF78",
    borderRadius: 30,
    height: 36,
    marginBottom: -3,
    width: 60,
  },
  avatarHead: {
    backgroundColor: "#82BF78",
    borderRadius: 13,
    height: 26,
    marginBottom: -2,
    width: 26,
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
    paddingTop: 12,
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
    minHeight: 132,
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
  name: {
    color: "#080808",
    fontFamily: "Grandstander_900Black",
    fontSize: 22,
    lineHeight: 27,
  },
  settingsButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    position: "absolute",
    right: 32,
    top: 12,
    width: 36,
    zIndex: 1,
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
