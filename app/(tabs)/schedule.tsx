import ScheduleItem from "@/components/schedule-related/schedule-item";
import {
  AlanSans_400Regular,
  AlanSans_500Medium,
  AlanSans_700Bold,
} from "@expo-google-fonts/alan-sans";
import { Grandstander_900Black } from "@expo-google-fonts/grandstander";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaskedView from "@react-native-masked-view/masked-view";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ESTIMATED_SCHEDULE_ITEM_HEIGHT = 112;
const FOCUSED_EVENT_TOP_OFFSET = ESTIMATED_SCHEDULE_ITEM_HEIGHT;

// Backend contract: every event should include a stable, unique database ID.
// Do not generate IDs during render; React and the expand state both rely on them.
const scheduleItems = [
  {
    id: "tokyo-0948",
    time: "09:48",
    title: "For Tokyo",
    startTime: "00:00",
    endTime: "00:00",
    location: "Platform 27",
    body: "This train has left the station. Please take the next one! JK! This box represents a past event, controlled by a flag called isActive",
    isActive: false,
    isPassed: true,
  },
  {
    id: "nagoya-0955",
    time: "09:55",
    title: "For Nagoya",
    startTime: "00:00",
    endTime: "00:00",
    location: "Platform 27",
    body: "This train has left the station. Please take the next one! JK! This box represents a past event, controlled by a flag called isActive",
    isActive: false,
    isPassed: true,
  },
  {
    id: "tokyo-1013",
    time: "10:13",
    title: "For Tokyo",
    startTime: "00:00",
    endTime: "00:00",
    location: "Platform 25",
    body: "We will be stopping at Kyoto, Nagoya, Shin-Yokohama, and Shinagawa. Non-reserved seats are in cars 1 to 3. Please keep your ticket with you until you leave the station. Passengers transferring at Tokyo should follow the signs on the platform.",
    isActive: true,
  },
  {
    id: "out-of-service-1050",
    time: "10:50",
    title: "Out of Service",
    startTime: "00:00",
    endTime: "00:00",
    location: "Platform 26",
  },
  {
    id: "tokyo-1110",
    time: "11:10",
    title: "For Tokyo",
    startTime: "00:00",
    endTime: "00:00",
    location: "Platform 25",
  },
  {
    id: "out-of-service-1125",
    time: "11:25",
    title: "Out of Service",
    startTime: "00:00",
    endTime: "00:00",
    location: "Platform 26",
  },
  {
    id: "tokyo-1135",
    time: "11:35",
    title: "For Tokyo",
    startTime: "00:00",
    endTime: "00:00",
    location: "Platform 25",
  },
  {
    id: "nagoya-1150",
    time: "11:50",
    title: "For Nagoya",
    startTime: "00:00",
    endTime: "00:00",
    location: "Platform 27",
  },
];

// Date Utility: Get an offset date
function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

// Format as MM/DD
function formatDate(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatFullDate(date: Date) {
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

function isBeforeToday(date: Date) {
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const dateStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  return dateStart < todayStart;
}

function isSameDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function toMinutes(time: string) {
  const [hours = "0", minutes = "0"] = time.split(":");

  return Number(hours) * 60 + Number(minutes);
}

function getScheduleFocusIndex(items: typeof scheduleItems, selectedDate: Date) {
  if (items.length === 0) {
    return -1;
  }

  const today = new Date();
  const activeIndex = items.findIndex((item) => item.isActive);

  if (isBeforeToday(selectedDate)) {
    return -1;
  }

  if (!isSameDay(selectedDate, today)) {
    return activeIndex === 0 ? activeIndex : -1;
  }

  if (activeIndex !== -1) {
    return activeIndex;
  }

  const currentMinutes = today.getHours() * 60 + today.getMinutes();
  const upcomingIndex = items.findIndex(
    (item) => toMinutes(item.startTime) >= currentMinutes
  );

  return upcomingIndex === -1 ? items.length - 1 : upcomingIndex;
}

function GradientDateText({
  date,
  direction,
}: {
  date: string;
  direction: "yesterday" | "tomorrow";
}) {
  const isYesterday = direction === "yesterday";

  return (
    <MaskedView
      maskElement={
        <Text style={[styles.dateText, styles.gradientDateMask]}>{date}</Text>
      }
    >
      <LinearGradient
        colors={[
          "rgba(163, 206, 38, 0.12)",
          "rgba(163, 206, 38, 0.72)",
        ]}
        start={{ x: isYesterday ? 0 : 1, y: 0.5 }}
        end={{ x: isYesterday ? 1 : 0, y: 0.5 }}
      >
        <Text style={[styles.dateText, styles.transparentDateText]}>
          {date}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const transitionAnim = useRef(new Animated.Value(1)).current;
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  // null means every event is collapsed; otherwise this stores the backend ID.
  const [expandedScheduleId, setExpandedScheduleId] = useState<string | null>(
    null
  );
  const [fontsLoaded] = useFonts({
    AlanSans_400Regular,
    AlanSans_500Medium,
    AlanSans_700Bold,
    Grandstander_900Black,
  });

  // Grab the selected day, plus the previous and next dates around it.
  const visibleDates = [
    addDays(selectedDate, -1),
    selectedDate,
    addDays(selectedDate, 1),
  ];
  const isSelectedDatePast = isBeforeToday(selectedDate);
  const focusIndex = useMemo(
    () => getScheduleFocusIndex(scheduleItems, selectedDate),
    [selectedDate]
  );

  useEffect(() => {
    transitionAnim.setValue(0);
    Animated.timing(transitionAnim, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const scrollTimer = setTimeout(() => {
      const shouldShowPreviousItem =
        isSameDay(selectedDate, new Date()) && focusIndex > 0;
      const focusedOffset = shouldShowPreviousItem
        ? FOCUSED_EVENT_TOP_OFFSET
        : 0;

      scrollViewRef.current?.scrollTo({
        y: Math.max(
          0,
          focusIndex * ESTIMATED_SCHEDULE_ITEM_HEIGHT - focusedOffset
        ),
        animated: true,
      });
    }, 150);

    return () => clearTimeout(scrollTimer);
  }, [focusIndex, selectedDate, transitionAnim]);

  const transitionStyle = {
    opacity: transitionAnim,
    transform: [
      {
        translateY: transitionAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 0],
        }),
      },
    ],
  };

  const selectedDateStyle = {
    opacity: transitionAnim,
    transform: [
      {
        scale: transitionAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.96, 1],
        }),
      },
    ],
  };

  const selectDate = (date: Date) => {
    // A new date receives a different schedule, so do not keep a stale event open.
    setExpandedScheduleId(null);
    setSelectedDate(date);
  };

  const toggleSchedule = (scheduleId: string) => {
    setExpandedScheduleId((currentId) =>
      currentId === scheduleId ? null : scheduleId
    );
  };

  if (!fontsLoaded) {
    return <View style={styles.screen} />;
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 62 }]}>
        <View
          accessibilityLabel="Settings"
          accessibilityRole="image"
          style={[styles.settingsIcon, { top: insets.top + 20 }]}
        >
          <Ionicons color="#000000" name="settings-outline" size={26} />
        </View>

        <View style={styles.dateRow}>
          {visibleDates.map((date, index) => {
            const formattedDate = formatDate(date);
            const isSelected = index === 1;

            if (isSelected) {
              return (
                <Animated.Text
                  key={formattedDate}
                  style={[
                    styles.dateText,
                    styles.selectedDateText,
                    selectedDateStyle,
                  ]}
                >
                  {formattedDate}
                </Animated.Text>
              );
            }

            return (
              <Pressable
                key={formattedDate}
                accessibilityRole="button"
                accessibilityLabel={`View schedule for ${formattedDate}`}
                hitSlop={12}
                onPress={() => selectDate(date)}
              >
                <GradientDateText
                  date={formattedDate}
                  direction={index === 0 ? "yesterday" : "tomorrow"}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.panelContent}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom: insets.bottom + 32,
              },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={transitionStyle}>
              {scheduleItems.map((item, index) => {
                const isFocusedItem = index === focusIndex;
                const isActive = !isSelectedDatePast && isFocusedItem;
                const isPassed =
                  isSelectedDatePast ||
                  (focusIndex !== -1 && !isActive && index < focusIndex);

                return (
                  <ScheduleItem
                    key={item.id}
                    time={item.time}
                    title={item.title}
                    startTime={item.startTime}
                    endTime={item.endTime}
                    location={item.location}
                    body={item.body}
                    isActive={isActive}
                    isExpanded={expandedScheduleId === item.id}
                    isPassed={isPassed}
                    activeDate={formatFullDate(selectedDate)}
                    onPress={() => toggleSchedule(item.id)}
                  />
                );
              })}
            </Animated.View>
          </ScrollView>

          <LinearGradient
            colors={[
              "rgba(255, 255, 255, 0)",
              "rgba(255, 255, 255, 0.72)",
              "rgba(255, 255, 255, 0.98)",
            ]}
            locations={[0, 0.55, 1]}
            pointerEvents="none"
            style={styles.scheduleFade}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#fff",
    flex: 1,
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    paddingBottom: 28,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    zIndex: 2,
  },
  panel: {
    flex: 1,
  },
  panelContent: {
    backgroundColor: "#FFFFFF",
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  dateRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  dateText: {
    color: "#A3CE26",
    fontFamily: "Grandstander_900Black",
    fontSize: 48,
    lineHeight: 58,
  },
  gradientDateMask: {
    backgroundColor: "transparent",
  },
  transparentDateText: {
    opacity: 0,
  },
  selectedDateText: {
    color: "#A3CE26",
    fontSize: 56,
    lineHeight: 72,
  },
  settingsIcon: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    position: "absolute",
    right: 28,
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  scheduleFade: {
    bottom: 0,
    height: 120,
    left: 0,
    position: "absolute",
    right: 0,
  },
});
