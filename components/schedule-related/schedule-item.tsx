import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  activeDate?: string;
  body?: string;
  endTime?: string;
  isActive?: boolean;
  isExpanded?: boolean;
  isPassed?: boolean;
  location?: string;
  onEdit?: () => void;
  onPress?: () => void;
  showEdit?: boolean;
  startTime?: string;
  time?: string;
  title?: string;
};

export default function ScheduleItem({
  activeDate = "2026.8.7",
  body = "Write down the body of the schedule. The administrator can provide the body in a unified format or the user can write it as a memo function.",
  endTime = "00:00",
  isActive = false,
  isExpanded = false,
  isPassed = false,
  location = "Space",
  onEdit,
  onPress,
  showEdit = false,
  startTime = "00:00",
  time = "00:00",
  title = "Schedule Title",
}: Props) {
  return (
    <Pressable
      accessibilityHint={
        isPassed
          ? "Past event. Tap to expand or collapse."
          : "Tap to expand or collapse."
      }
      accessibilityLabel={`${title}, ${time}`}
      accessibilityRole="button"
      accessibilityState={{ expanded: isExpanded }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        isActive && styles.activeContainer,
        pressed && styles.pressedContainer,
      ]}
    >
      <View style={styles.leftColumn}>
        {isActive && <Text style={styles.activeDate}>{activeDate}</Text>}
        <Text style={[styles.timeLabel, isActive && styles.activeText]}>
          {time}
        </Text>
      </View>

      {isActive ? (
        <LinearGradient
          colors={["#A3CE26", "#FFFFFF", "#FFFFFF", "#A3CE26"]}
          end={{ x: 0.5, y: 1 }}
          locations={[0, 0.12, 0.88, 1]}
          start={{ x: 0.5, y: 0 }}
          style={styles.timeline}
        />
      ) : (
        <View style={[styles.timeline, styles.inactiveTimeline]} />
      )}

      <View
        style={[
          styles.details,
          isExpanded && styles.expandedDetails,
        ]}
      >
        <View style={styles.headingRow}>
          <View
            style={[
              styles.titlePill,
              isActive && styles.activeTitlePill,
              isExpanded && styles.expandedTitlePill,
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.titleText,
                isActive && styles.activeTitleText,
                isExpanded && styles.expandedTitleText,
              ]}
            >
              {title}
            </Text>
          </View>
          {showEdit && (
            <Pressable
              accessibilityLabel={`Edit ${title}`}
              accessibilityRole="button"
              hitSlop={8}
              onPress={(event) => {
                event.stopPropagation();
                onEdit?.();
              }}
              style={({ pressed }) => [
                styles.editButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Text style={[styles.editText, isActive && styles.activeEditText]}>
                Edit
              </Text>
            </Pressable>
          )}
        </View>

        <View
          style={[
            styles.metadataRow,
            isExpanded && styles.expandedMetadataRow,
          ]}
        >
          <View
            style={[
              styles.metadataPill,
              isActive && styles.activeMetadataPill,
              isExpanded && styles.expandedMetadataPill,
            ]}
          >
            <Text
              style={[
                styles.metadataText,
                isActive && styles.activeMetadataText,
                isExpanded && styles.expandedMetadataText,
              ]}
            >
              {location}
            </Text>
          </View>
          <View
            style={[
              styles.metadataPill,
              isActive && styles.activeMetadataPill,
              isExpanded && styles.expandedMetadataPill,
            ]}
          >
            <Text
              style={[
                styles.metadataText,
                isActive && styles.activeMetadataText,
                isExpanded && styles.expandedMetadataText,
              ]}
            >
              {startTime} ~ {endTime}
            </Text>
          </View>
        </View>

        {/* The API sends one complete body; collapsed rows only clamp its lines. */}
        <Text
          numberOfLines={isExpanded ? undefined : 2}
          style={[
            styles.bodyText,
            isActive && styles.activeText,
            isExpanded && styles.expandedBodyText,
          ]}
        >
          {body}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  activeContainer: {
    backgroundColor: "#A3CE26",
  },
  activeDate: {
    color: "#FFFFFF",
    fontFamily: "AlanSans_700Bold",
    fontSize: 9,
    lineHeight: 12,
  },
  activeMetadataPill: {
    backgroundColor: "#87C27C",
  },
  activeMetadataText: {
    color: "#FFFFFF",
  },
  activeText: {
    color: "#FFFFFF",
  },
  activeTitlePill: {
    backgroundColor: "#FFFFFF",
  },
  activeTitleText: {
    color: "#000000",
  },
  bodyText: {
    color: "#000000",
    fontFamily: "AlanSans_400Regular",
    fontSize: 11,
    lineHeight: 15,
    marginTop: 3,
  },
  container: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    minHeight: 112,
    position: "relative",
  },
  details: {
    alignItems: "flex-start",
    flex: 1,
    paddingBottom: 14,
    paddingLeft: 12,
    paddingRight: 28,
    paddingTop: 14,
  },
  expandedBodyText: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 12,
  },
  expandedDetails: {
    paddingBottom: 20,
    paddingTop: 16,
  },
  expandedMetadataPill: {
    borderRadius: 12,
    maxWidth: "100%",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  expandedMetadataRow: {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: 6,
    marginTop: 7,
    width: "100%",
  },
  expandedMetadataText: {
    fontSize: 12,
    lineHeight: 15,
  },
  expandedTitlePill: {
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  expandedTitleText: {
    fontSize: 19,
    lineHeight: 23,
  },
  activeEditText: {
    color: "#FFFFFF",
  },
  editButton: {
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  editText: {
    color: "#7DA515",
    fontFamily: "AlanSans_500Medium",
    fontSize: 9,
  },
  headingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    width: "100%",
  },
  inactiveTimeline: {
    backgroundColor: "#A3CE26",
  },
  leftColumn: {
    alignItems: "flex-end",
    height: 112,
    paddingRight: 8,
    paddingTop: 16,
    width: 96,
  },
  metadataPill: {
    backgroundColor: "#F3F3F3",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  metadataRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 5,
  },
  metadataText: {
    color: "#A6A6A6",
    fontFamily: "AlanSans_400Regular",
    fontSize: 9,
    lineHeight: 11,
  },
  pressedContainer: {
    opacity: 0.82,
  },
  timeline: {
    height: 112,
    left: 96,
    position: "absolute",
    top: 0,
    width: 1,
  },
  timeLabel: {
    color: "#000000",
    fontFamily: "AlanSans_700Bold",
    fontSize: 10,
    lineHeight: 13,
  },
  titlePill: {
    backgroundColor: "#A6A6A6",
    borderRadius: 9,
    flexShrink: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  titleText: {
    color: "#FFFFFF",
    fontFamily: "AlanSans_700Bold",
    fontSize: 13,
    lineHeight: 16,
  },
});
