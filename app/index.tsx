import { AdminLoginSheet } from "@/components/schedule-related/admin-login-sheet";
import { EditEventSheet } from "@/components/schedule-related/edit-event-sheet";
import ScheduleItem from "@/components/schedule-related/schedule-item";
import { hasAdminSession, signOut } from "@/services/auth";
import { getSchedule } from "@/services/schedule";
import type { ScheduleEvent } from "@/types/schedule-event";
import {
  AlanSans_400Regular,
  AlanSans_500Medium,
  AlanSans_700Bold,
} from "@expo-google-fonts/alan-sans";
import { Grandstander_900Black } from "@expo-google-fonts/grandstander";
import MaskedViewBase from "@react-native-masked-view/masked-view";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import {
  type ComponentType,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  AppState,
  Easing,
  Image,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  Text,
  type TextStyle,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// SDK 58 removed NativeMethods, which this package's types still extend.
const MaskedView = MaskedViewBase as unknown as ComponentType<{
  children?: ReactNode;
  maskElement: ReactElement;
}>;

const ESTIMATED_SCHEDULE_ITEM_HEIGHT = 112;
const FOCUSED_EVENT_TOP_OFFSET = ESTIMATED_SCHEDULE_ITEM_HEIGHT;

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatDate(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatFullDate(date: Date) {
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

function formatWeekday(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
  });
}

function isBeforeToday(date: Date) {
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const dateStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
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

function isHackathonDate(date: Date) {
  const day = date.getDate();

  return (
    date.getFullYear() === 2026 &&
    date.getMonth() === 10 &&
    day >= 13 &&
    day <= 15
  );
}

// Outside November 13–15, open the schedule on the first hackathon day.
function scheduleHomeDate() {
  const today = new Date();
  if (isHackathonDate(today)) return today;
  return new Date(2026, 10, 13);
}

function toMinutes(time: string) {
  const date = new Date(time);

  return date.getHours() * 60 + date.getMinutes();
}

function formatEventTime(time: string) {
  const date = new Date(time);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getActiveEventIndex(items: ScheduleEvent[], now: Date) {
  return items.findIndex(
    (item) => new Date(item.startTime) <= now && now < new Date(item.endTime),
  );
}

function getScheduleFocusIndex(items: ScheduleEvent[], selectedDate: Date) {
  if (items.length === 0) {
    return -1;
  }

  const today = new Date();
  if (isBeforeToday(selectedDate)) {
    return -1;
  }

  if (!isSameDay(selectedDate, today)) {
    return -1;
  }

  const activeIndex = getActiveEventIndex(items, today);
  if (activeIndex !== -1) {
    return activeIndex;
  }

  return items.findIndex((item) => new Date(item.startTime) > today);
}

function GradientDateText({
  date,
  direction,
  muted = false,
}: {
  date: string;
  direction: "yesterday" | "tomorrow";
  muted?: boolean;
}) {
  const isYesterday = direction === "yesterday";
  const colors = muted
    ? (["rgba(154, 154, 154, 0.28)", "rgba(154, 154, 154, 0.82)"] as const)
    : (["rgba(163, 206, 38, 0.12)", "rgba(163, 206, 38, 0.72)"] as const);

  if (Platform.OS === "web") {
    const gradientDirection = isYesterday ? "to right" : "to left";
    const webGradientStyle = {
      backgroundClip: "text",
      backgroundImage: `linear-gradient(${gradientDirection}, ${colors.join(", ")})`,
      color: "transparent",
    } as TextStyle;

    return <Text style={[styles.dateText, webGradientStyle]}>{date}</Text>;
  }

  return (
    <MaskedView
      maskElement={
        <Text style={[styles.dateText, styles.gradientDateMask]}>{date}</Text>
      }
    >
      <LinearGradient
        colors={colors}
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
  const scrollViewRef = useRef<ScrollViewInstance>(null);
  const transitionAnim = useRef(new Animated.Value(1)).current;
  const todayPressAnim = useRef(new Animated.Value(0)).current;
  const [selectedDate, setSelectedDate] = useState(scheduleHomeDate);
  const [expandedScheduleId, setExpandedScheduleId] = useState<string | null>(
    null,
  );
  const [scheduleItems, setScheduleItems] = useState<ScheduleEvent[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [fontsLoaded] = useFonts({
    AlanSans_400Regular,
    AlanSans_500Medium,
    AlanSans_700Bold,
    Grandstander_900Black,
  });

  const visibleDates = [
    addDays(selectedDate, -1),
    selectedDate,
    addDays(selectedDate, 1),
  ];
  const isSelectedDatePast = isBeforeToday(selectedDate);
  const isSelectedDateToday = isSameDay(selectedDate, new Date());

  useEffect(() => {
    if (!isSelectedDateToday) {
      todayPressAnim.setValue(0);
    }
  }, [isSelectedDateToday, todayPressAnim]);

  useEffect(() => {
    let active = true;
    hasAdminSession().then((admin) => {
      if (active) setIsAdmin(admin);
    });
    return () => {
      active = false;
    };
  }, []);

  const selectedScheduleItems = useMemo(
    () =>
      scheduleItems.filter((item) =>
        isSameDay(new Date(item.startTime), selectedDate),
      ),
    [scheduleItems, selectedDate],
  );
  const focusIndex = useMemo(
    () => getScheduleFocusIndex(selectedScheduleItems, selectedDate),
    [selectedScheduleItems, selectedDate],
  );

  const loadSchedule = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoadingSchedule(true);
      setScheduleError(null);
    }

    try {
      const data = await getSchedule();

      setScheduleItems(
        [...data].sort(
          (left, right) =>
            toMinutes(left.startTime) - toMinutes(right.startTime),
        ),
      );
      if (silent) setScheduleError(null);
    } catch (error) {
      if (!silent) {
        setScheduleError(
          error instanceof Error
            ? error.message
            : "Unable to load the schedule.",
        );
      }
    } finally {
      if (!silent) setIsLoadingSchedule(false);
    }
  }, []);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        loadSchedule(true);
      }
    });

    return () => subscription.remove();
  }, [loadSchedule]);

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
          focusIndex * ESTIMATED_SCHEDULE_ITEM_HEIGHT - focusedOffset,
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
    setExpandedScheduleId(null);
    setSelectedDate(date);
  };

  const dateSwipeResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      const isHorizontal =
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      return isHorizontal && Math.abs(gestureState.dx) > 10;
    },

    onPanResponderRelease: (_, gestureState) => {
      const swipeThreshold = 50;

      if (gestureState.dx < -swipeThreshold) {
        selectDate(addDays(selectedDate, 1));
      } else if (gestureState.dx > swipeThreshold) {
        selectDate(addDays(selectedDate, -1));
      }
    },
  });

  const toggleSchedule = (scheduleId: string) => {
    setExpandedScheduleId((currentId) =>
      currentId === scheduleId ? null : scheduleId,
    );
  };

  if (!fontsLoaded) {
    return <View style={styles.screen} />;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.contentShell}>
        <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
          <View
            pointerEvents="box-none"
            style={[styles.signInSlot, { top: insets.top + 26 }]}
          >
            <Pressable
              accessibilityLabel={isAdmin ? "Sign out" : "Sign in"}
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => {
                if (isAdmin) {
                  setEditingEvent(null);
                  setIsAdmin(false);
                  void signOut();
                  return;
                }
                setLoginOpen(true);
              }}
            >
              <Text style={[styles.signInText, isAdmin && styles.signInTextActive]}>
                {isAdmin ? "Sign out" : "Sign in"}
              </Text>
            </Pressable>
          </View>
          <View
            pointerEvents="box-none"
            style={[styles.backToTodaySlot, { top: insets.top + 26 }]}
          >
            {!isSelectedDateToday && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back to today's schedule"
                hitSlop={8}
                onPress={() => selectDate(new Date())}
                onPressIn={() => {
                  Animated.timing(todayPressAnim, {
                    toValue: 1,
                    duration: 80,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                  }).start();
                }}
                onPressOut={() => {
                  Animated.timing(todayPressAnim, {
                    toValue: 0,
                    duration: 110,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                  }).start();
                }}
              >
                <Animated.View
                  style={[
                    styles.backToTodayButton,
                    {
                      opacity: todayPressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0.65],
                      }),
                      transform: [
                        {
                          scale: todayPressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 0.94],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.backToTodayText}>Back to Today 🐞</Text>
                </Animated.View>
              </Pressable>
            )}
          </View>
          <View style={styles.dateRow} {...dateSwipeResponder.panHandlers}>
            {visibleDates.map((date, index) => {
              const formattedDate = formatDate(date);
              const weekday = formatWeekday(date);
              const isSelected = index === 1;
              const hackathonDate = isHackathonDate(date);

              if (isSelected) {
                return (
                  <Animated.View
                    key={formattedDate}
                    style={[styles.selectedDateColumn, selectedDateStyle]}
                  >
                    <Text
                      style={[
                        styles.weekdayText,
                        !hackathonDate && styles.mutedDateText,
                      ]}
                    >
                      {weekday}
                    </Text>
                    <Text
                      style={[
                        styles.dateText,
                        styles.selectedDateText,
                        !hackathonDate && styles.mutedDateText,
                      ]}
                    >
                      {formattedDate}
                    </Text>
                  </Animated.View>
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
                    muted={!hackathonDate}
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
                {isLoadingSchedule ? (
                  <Text style={styles.statusText}>Loading schedule...</Text>
                ) : scheduleError ? (
                  <Text style={styles.errorText}>{scheduleError}</Text>
                ) : selectedScheduleItems.length === 0 ? (
                  <Text style={styles.statusText}>No events scheduled.</Text>
                ) : (
                  selectedScheduleItems.map((item) => {
                    const itemKey = `${item.startTime}-${item.title}`;
                    const now = new Date();
                    const isActive =
                      isSameDay(selectedDate, now) &&
                      new Date(item.startTime) <= now &&
                      now < new Date(item.endTime);
                    const isPassed =
                      isSelectedDatePast ||
                      (!isActive && new Date(item.endTime) <= now);

                    return (
                      <ScheduleItem
                        key={itemKey}
                        time={formatEventTime(item.startTime)}
                        title={item.title}
                        startTime={formatEventTime(item.startTime)}
                        endTime={formatEventTime(item.endTime)}
                        location={item.location}
                        points={item.points}
                        isDeadline={item.isDeadline === true}
                        body={item.body}
                        isActive={isActive}
                        isExpanded={expandedScheduleId === itemKey}
                        isPassed={isPassed}
                        activeDate={formatFullDate(selectedDate)}
                        onEdit={() => setEditingEvent(item)}
                        onPress={() => toggleSchedule(itemKey)}
                        showEdit={isAdmin}
                      />
                    );
                  })
                )}
              </Animated.View>
            </ScrollView>
          </View>
        </View>
      </View>
      <View pointerEvents="none" style={styles.corners}>
        <Image
          source={require("@/assets/images/bottom_left.png")}
          style={styles.bottomLeft}
        />
        <Image
          source={require("@/assets/images/bottom_right.png")}
          style={styles.bottomRight}
        />
      </View>
      <AdminLoginSheet
        onClose={() => setLoginOpen(false)}
        onSignedIn={() => {
          setIsAdmin(true);
          setLoginOpen(false);
        }}
        visible={loginOpen}
      />
      <EditEventSheet
        event={isAdmin ? editingEvent : null}
        onClose={() => setEditingEvent(null)}
        onSaved={() => loadSchedule()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: "#C93D2A",
    fontFamily: "AlanSans_400Regular",
    fontSize: 14,
    paddingHorizontal: 32,
    paddingTop: 40,
    textAlign: "center",
  },
  contentShell: {
    alignSelf: "center",
    flex: 1,
    maxWidth: 900,
    width: "100%",
  },
  screen: {
    backgroundColor: "#EDF3F7",
    flex: 1,
  },
  header: {
    backgroundColor: "#EDF3F7",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    paddingBottom: 16,
    position: "relative",
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
    backgroundColor: "#EDF3F7",
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  backToTodayButton: {
    backgroundColor: "#F3F9E7",
    borderColor: "#A3CE26",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backToTodaySlot: {
    alignItems: "center",
    height: 26,
    justifyContent: "center",
    position: "absolute",
    right: 12,
    width: 116,
    zIndex: 1,
  },
  signInSlot: {
    height: 26,
    justifyContent: "center",
    left: 16,
    position: "absolute",
    zIndex: 1,
  },
  signInText: {
    color: "#8A8A8A",
    fontFamily: "AlanSans_400Regular",
    fontSize: 12,
    lineHeight: 16,
  },
  signInTextActive: {
    color: "#5F7F00",
    fontFamily: "AlanSans_700Bold",
  },
  backToTodayText: {
    color: "#5F7F00",
    fontFamily: "AlanSans_700Bold",
    fontSize: 11,
    lineHeight: 14,
  },
  dateRow: {
    alignItems: "flex-end",
    alignSelf: "stretch",
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    overflow: "hidden",
  },
  dateText: {
    color: "#A3CE26",
    fontFamily: "Grandstander_900Black",
    fontSize: 52,
    lineHeight: 62,
  },
  gradientDateMask: {
    backgroundColor: "transparent",
  },
  transparentDateText: {
    opacity: 0,
  },
  selectedDateText: {
    color: "#A3CE26",
    fontSize: 64,
    lineHeight: 72,
  },
  mutedDateText: {
    color: "#9A9A9A",
  },
  selectedDateColumn: {
    alignItems: "center",
  },
  weekdayText: {
    color: "#A3CE26",
    fontFamily: "Grandstander_900Black",
    fontSize: 24,
    lineHeight: 30,
    paddingTop: 2,
  },
  statusText: {
    color: "#777777",
    fontFamily: "AlanSans_400Regular",
    fontSize: 14,
    paddingHorizontal: 32,
    paddingTop: 40,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  corners: {
    ...StyleSheet.absoluteFill,
    opacity: 0.4,
    overflow: "hidden",
  },
  bottomLeft: {
    position: "absolute",
    width: 210,
    height: 172,
    left: -78,
    bottom: -46,
  },
  bottomRight: {
    position: "absolute",
    width: 168,
    height: 200,
    right: -62,
    bottom: -64,
  },
});
