import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function paramValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default function ScannedProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    name?: string;
    email?: string;
    teamName?: string;
    points?: string;
    checkedIn?: string;
    maxPoints?: string;
  }>();

  const rawName = paramValue(params.name);
  const name = rawName
    ? rawName.startsWith("@")
      ? rawName
      : `@${rawName}`
    : "@";
  const email = paramValue(params.email);
  const teamName = paramValue(params.teamName);
  const points = Number(paramValue(params.points) || 0);
  const maxPoints = Number(paramValue(params.maxPoints) || 100);
  const checkedIn = paramValue(params.checkedIn) === "true";
  const progress = Math.min(maxPoints > 0 ? points / maxPoints : 0, 1);

  return (
    <View style={[styles.page, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.topRow}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back to scanner"
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color="#111" />
        </Pressable>
      </View>

      <View style={styles.identity}>
        <View style={styles.usernameRow}>
          <Text style={styles.username}>{name}</Text>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={12} color="#fff" />
          </View>
        </View>
        {teamName ? (
          <View style={styles.teamBadge}>
            <Text style={styles.teamBadgeText}>{teamName}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.pointsRow}>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsBadgeText}>
            {points} {points === 1 ? "point" : "points"}
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
              {points}
            </Text>
            <Text style={styles.progressLabelMuted}>{maxPoints}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
            <View
              style={[styles.progressThumb, { left: `${progress * 100}%` }]}
            />
          </View>
        </View>
      </View>

      <View style={styles.detailList}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Check in</Text>
          <View style={[styles.validBadge, !checkedIn && styles.invalidBadge]}>
            <Text style={styles.validBadgeText}>
              {checkedIn ? "Valid" : "Invalid"}
            </Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>{email}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 28,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  backButton: {
    paddingTop: 4,
  },
  identity: {
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
  invalidBadge: {
    backgroundColor: "#E53935",
  },
  validBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
