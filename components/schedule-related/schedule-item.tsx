import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { LinkedText } from "@/components/linked-text";

const EXPAND_TIMING = {
  duration: 150,
  easing: Easing.out(Easing.cubic),
};

type Props = {
  activeDate?: string;
  body?: string;
  endTime?: string;
  isActive?: boolean;
  isDeadline?: boolean;
  isExpanded?: boolean;
  isPassed?: boolean;
  location?: string;
  onEdit?: () => void;
  onPress?: () => void;
  points?: number;
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
  isDeadline = false,
  isExpanded = false,
  isPassed = false,
  location = "Space",
  onEdit,
  onPress,
  points,
  showEdit = false,
  startTime = "00:00",
  time = "00:00",
  title = "Schedule Title",
}: Props) {
  const expand = useSharedValue(isExpanded ? 1 : 0);

  useEffect(() => {
    expand.value = withTiming(isExpanded ? 1 : 0, EXPAND_TIMING);
  }, [expand, isExpanded]);

  const detailsStyle = useAnimatedStyle(() => ({
    paddingBottom: interpolate(expand.value, [0, 1], [14, 20]),
    paddingTop: interpolate(expand.value, [0, 1], [14, 16]),
  }));
  const titlePillStyle = useAnimatedStyle(() => ({
    borderRadius: interpolate(expand.value, [0, 1], [9, 11]),
    paddingHorizontal: interpolate(expand.value, [0, 1], [10, 12]),
    paddingVertical: interpolate(expand.value, [0, 1], [4, 6]),
  }));
  const titleTextStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(expand.value, [0, 1], [13, 19]),
    lineHeight: interpolate(expand.value, [0, 1], [16, 23]),
  }));
  const metadataPillStyle = useAnimatedStyle(() => ({
    borderRadius: interpolate(expand.value, [0, 1], [10, 12]),
    paddingHorizontal: interpolate(expand.value, [0, 1], [8, 10]),
    paddingVertical: interpolate(expand.value, [0, 1], [3, 5]),
  }));
  const metadataTextStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(expand.value, [0, 1], [9, 12]),
    lineHeight: interpolate(expand.value, [0, 1], [11, 15]),
  }));
  const bodyTextStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(expand.value, [0, 1], [11, 12]),
    lineHeight: interpolate(expand.value, [0, 1], [15, 17]),
    marginTop: interpolate(expand.value, [0, 1], [3, 12]),
  }));

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

      <Animated.View style={[styles.details, detailsStyle]}>
        <View style={styles.headingRow}>
          <View style={styles.titleWrap}>
            <Animated.View
              style={[
                styles.titlePill,
                isActive && styles.activeTitlePill,
                titlePillStyle,
              ]}
            >
              <Animated.Text
                style={[
                  styles.titleText,
                  isActive && styles.activeTitleText,
                  titleTextStyle,
                ]}
              >
                {title}
              </Animated.Text>
            </Animated.View>
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
              <Text
                style={[styles.editText, isActive && styles.activeEditText]}
              >
                Edit
              </Text>
            </Pressable>
          )}
        </View>

        <View
          style={[styles.metadataRow, isExpanded && styles.expandedMetadataRow]}
        >
          <Animated.View
            style={[
              styles.metadataPill,
              isActive && styles.activeMetadataPill,
              isExpanded && styles.expandedMetadataPill,
              metadataPillStyle,
            ]}
          >
            <Animated.Text
              style={[
                styles.metadataText,
                isActive && styles.activeMetadataText,
                metadataTextStyle,
              ]}
            >
              {location}
            </Animated.Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.metadataPill,
              isActive && styles.activeMetadataPill,
              isExpanded && styles.expandedMetadataPill,
              metadataPillStyle,
            ]}
          >
            <Animated.Text
              style={[
                styles.metadataText,
                isActive && styles.activeMetadataText,
                metadataTextStyle,
              ]}
            >
              {startTime} ~ {endTime}
            </Animated.Text>
          </Animated.View>
          {points != null && !isDeadline ? (
            <Animated.View
              style={[
                styles.metadataPill,
                isActive && styles.activeMetadataPill,
                isExpanded && styles.expandedMetadataPill,
                metadataPillStyle,
              ]}
            >
              <Animated.Text
                style={[
                  styles.metadataText,
                  isActive && styles.activeMetadataText,
                  metadataTextStyle,
                ]}
              >
                {points} {points === 1 ? "pt" : "pts"}
              </Animated.Text>
            </Animated.View>
          ) : null}
          {isDeadline ? (
            <Animated.View
              style={[
                styles.metadataPill,
                styles.deadlinePill,
                isExpanded && styles.expandedMetadataPill,
                metadataPillStyle,
              ]}
            >
              <Animated.Text style={[styles.deadlineText, metadataTextStyle]}>
                Deadline
              </Animated.Text>
            </Animated.View>
          ) : null}
        </View>

        {/* The API sends one complete body; collapsed rows only clamp its lines. */}
        <LinkedText
          numberOfLines={isExpanded ? undefined : 2}
          style={[
            styles.bodyText,
            isActive && styles.activeText,
            bodyTextStyle,
          ]}
        >
          {body}
        </LinkedText>
      </Animated.View>
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
    backgroundColor: "#EDF3F7",
    flexDirection: "row",
    minHeight: 112,
    position: "relative",
  },
  deadlinePill: {
    backgroundColor: "#C93D2A",
  },
  deadlineText: {
    color: "#FFFFFF",
    fontFamily: "AlanSans_700Bold",
    fontSize: 9,
    lineHeight: 11,
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
  expandedDeadlineText: {
    fontSize: 12,
    lineHeight: 15,
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
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  editText: {
    color: "#7DA515",
    fontFamily: "AlanSans_500Medium",
    fontSize: 16,
  },
  headingRow: {
    alignItems: "flex-start",
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
    minHeight: 112,
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
    flexWrap: "wrap",
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
    bottom: 0,
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
  titleWrap: {
    flex: 1,
    flexDirection: "row",
  },
  titleText: {
    color: "#FFFFFF",
    fontFamily: "AlanSans_700Bold",
    fontSize: 13,
    lineHeight: 16,
  },
});
