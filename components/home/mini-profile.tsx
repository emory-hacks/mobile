import { Image, StyleSheet, Text, View, useColorScheme } from "react-native";

// Receive API calls for user profile
type UserProfile = {
  name: string;
  teamName: string;
  email: string;
  avatarUrl?: string;
};

export default function MiniProfile({
  name,
  teamName,
  email,
  avatarUrl,
}: UserProfile) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={styles.container}>
      <View style={styles.textGroup}>
        <Text style={[styles.name, { color: isDark ? "#FFFFFF" : "#000000" }]}>
          {name}
        </Text>
        <Text
          style={[styles.teamName, { color: isDark ? "#FFFFFF" : "#111111" }]}
        >
          {teamName}
        </Text>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[styles.email, { color: isDark ? "#AFAFAF" : "#A8A8A8" }]}
        >
          {email}
        </Text>
      </View>

      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingVertical: 24,
    width: "100%",
  },
  textGroup: {
    flex: 1,
    paddingRight: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 29,
    marginBottom: 10,
  },
  teamName: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    lineHeight: 18,
  },
  avatar: {
    borderRadius: 45,
    height: 90,
    width: 90,
  },
  avatarPlaceholder: {
    backgroundColor: "#A9A9A9",
    borderRadius: 45,
    height: 90,
    width: 90,
  },
});
