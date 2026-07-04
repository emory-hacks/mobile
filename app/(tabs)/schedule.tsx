import ScheduleItem from "@/components/schedule-related/schedule-item";
import MaskedView from "@react-native-masked-view/masked-view";
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

// Fake Schedule Items, will receive API calls
const scheduleItems = [
  {
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
    time: "10:13",
    title: "For Tokyo",
    startTime: "00:00",
    endTime: "00:00",
    location: "Platform 25",
    body: "We will be stopping at Kyoto, Nagoya, Shin-Yokohama, and Shinagawa. Non-reserved seats are in car number 1 to 3.",
    isActive: true,
  },
  {
    time: "10:50",
    title: "Out of Service",
    startTime: "00:00",
    endTime: "00:00",
    location: "Platform 26",
  },
  {
    time: "11:10",
    title: "For Tokyo",
    startTime: "00:00",
    endTime: "00:00",
    location: "Platform 25",
  },
  {
    time: "11:25",
    title: "Out of Service",
    startTime: "00:00",
    endTime: "00:00",
    location: "Platform 26",
  },
  {
    time: "11:35",
    title: "For Tokyo",
    startTime: "00:00",
    endTime: "00:00",
    location: "Platform 25",
  },
  {
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
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
  });
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
        colors={["#d8d8d8", "#8f8f8f"]}
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

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16 }]}>
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
              onPress={() => setSelectedDate(date)}
            >
              <GradientDateText
                date={formattedDate}
                direction={index === 0 ? "yesterday" : "tomorrow"}
              />
            </Pressable>
          );
        })}
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
                paddingTop: focusIndex === 0 ? 0 : 8,
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
                    key={`${item.time}-${index}`}
                    time={item.time}
                    title={item.title}
                    startTime={item.startTime}
                    endTime={item.endTime}
                    location={item.location}
                    body={item.body}
                    isActive={isActive}
                    isPassed={isPassed}
                  />
                );
              })}
            </Animated.View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  panel: {
    flex: 1,
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  panelContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    overflow: "hidden",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 32,
    backgroundColor: "#fff",
    paddingTop: 12,
    paddingBottom: 4,
  },
  dateText: {
    color: "#9d9d9d",
    fontSize: 21,
    fontWeight: "700",
  },
  gradientDateMask: {
    backgroundColor: "transparent",
  },
  transparentDateText: {
    opacity: 0,
  },
  selectedDateText: {
    color: "#000",
    fontSize: 31,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
});
