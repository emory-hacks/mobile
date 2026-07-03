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
        <Text
          style={[
            styles.timeLabel,
            isDark && styles.activeText,
            isPassed && styles.passedText,
          ]}
        >
          {time}
        </Text>
      </View>

      <View
        style={[
          styles.verticalDivider,
          isDark && styles.activeDivider,
          isPassed && styles.passedDivider,
        ]}
      />

      <View style={styles.rightCol}>
        <View style={styles.topRow}>
          <View
            style={[
              styles.titlePill,
              isDark && styles.activeTitlePill,
              isPassed && styles.passedTitlePill,
            ]}
          >
            <Text
              style={[
                styles.titleText,
                isDark && styles.activeTitleText,
                isPassed && styles.passedTitleText,
              ]}
            >
              {title}
            </Text>
          </View>
          <View style={styles.timeRange}>
            <Text
              style={[
                styles.timeRangeText,
                isDark && styles.activeMetaText,
                isPassed && styles.passedMetaText,
              ]}
            >
              {startTime} ~ {endTime}
            </Text>
            <Text
              style={[
                styles.locationText,
                isDark && styles.activeMetaText,
                isPassed && styles.passedMetaText,
              ]}
            >
              {location}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.bodyText,
            isDark && styles.activeText,
            isPassed && styles.passedBodyText,
          ]}
        >
          {body}
        </Text>
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
    position: 'relative',
  },
  activeContainer: {
    backgroundColor: '#000',
  },
  passedContainer: {
    backgroundColor: '#fff',
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
    bottom: 0,
    left: 80,
    position: 'absolute',
    top: 0,
    width: 1,
    backgroundColor: '#000',
  },
  activeDivider: {
    backgroundColor: '#fff',
  },
  passedDivider: {
    backgroundColor: '#d0d0d0',
  },
  rightCol: {
    flex: 1,
    gap: 9,
    marginLeft: 21,
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
  passedTitlePill: {
    backgroundColor: '#e9e9e9',
  },
  titleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  activeTitleText: {
    color: '#000',
  },
  passedTitleText: {
    color: '#fdfdfd',
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
  passedText: {
    color: '#e2e2e2',
  },
  passedMetaText: {
    color: '#e2e2e2',
  },
  passedBodyText: {
    color: '#bcbcbc',
  },
});
