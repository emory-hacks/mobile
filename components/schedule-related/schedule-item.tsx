import { StyleSheet, Text, View } from 'react-native';

type Props = {
  time?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  body?: string;
  isActive?: boolean;
  isPassed?: boolean;
};

export default function ScheduleItem({
  time = '00:00',
  title = 'Schedule Title',
  startTime = '00:00',
  endTime = '00:00',
  location = 'space',
  body = 'Write down the body of the schedule. The administrator can provide the body in a unified format or the user can write it as a memo function.',
  isActive = false,
  isPassed = false,
}: Props) {
  const isDark = isActive && !isPassed;

  return (
    <View
      style={[
        styles.container,
        isDark && styles.activeContainer,
        isPassed && styles.passedContainer,
      ]}
      accessibilityState={{ disabled: isPassed }}
    >
      <View style={styles.leftCol}>
        <Text style={[styles.timeLabel, isDark && styles.activeText]}>
          {time}
        </Text>
      </View>

      <View style={[styles.verticalDivider, isDark && styles.activeDivider]} />

      <View style={styles.rightCol}>
        <View style={styles.topRow}>
          <View style={[styles.titlePill, isDark && styles.activeTitlePill]}>
            <Text style={[styles.titleText, isDark && styles.activeTitleText]}>
              {title}
            </Text>
          </View>
          <View style={styles.timeRange}>
            <Text style={[styles.timeRangeText, isDark && styles.activeMetaText]}>
              {startTime} ~ {endTime}
            </Text>
            <Text style={[styles.locationText, isDark && styles.activeMetaText]}>
              {location}
            </Text>
          </View>
        </View>
        <Text style={[styles.bodyText, isDark && styles.activeText]}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 12,
  },
  activeContainer: {
    backgroundColor: '#000',
  },
  passedContainer: {
    opacity: 0.2,
  },
  leftCol: {
    width: 58,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 3,
  },
  timeLabel: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#000',
    marginHorizontal: 10,
  },
  activeDivider: {
    backgroundColor: '#fff',
  },
  rightCol: {
    flex: 1,
    gap: 9,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titlePill: {
    backgroundColor: '#000',
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  activeTitlePill: {
    backgroundColor: '#fff',
  },
  titleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  activeTitleText: {
    color: '#000',
  },
  timeRange: {
    alignItems: 'flex-end',
  },
  timeRangeText: {
    color: '#8f8f8f',
    fontSize: 9,
  },
  locationText: {
    color: '#8f8f8f',
    fontSize: 9,
  },
  bodyText: {
    color: '#000',
    fontSize: 11,
    textAlign: 'justify',
    lineHeight: 15,
  },
  activeText: {
    color: '#fff',
  },
  activeMetaText: {
    color: '#d7d7d7',
  },
});
