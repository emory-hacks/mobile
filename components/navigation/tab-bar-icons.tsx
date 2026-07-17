import { Image, type ImageSource } from "expo-image";

type TabBarIconProps = {
  filled: boolean;
};

type IconImageProps = {
  emptySource: ImageSource;
  filled: boolean;
  filledSource: ImageSource;
  height: number;
  width: number;
};

function IconImage({
  emptySource,
  filled,
  filledSource,
  height,
  width,
}: IconImageProps) {
  return (
    <Image
      contentFit="fill"
      source={filled ? filledSource : emptySource}
      style={{ height, width }}
    />
  );
}

export function CalendarTabIcon({ filled }: TabBarIconProps) {
  return (
    <IconImage
      emptySource={require("@/assets/images/icons/navigation/calendar-empty.svg")}
      filled={filled}
      filledSource={require("@/assets/images/icons/navigation/calendar-filled.svg")}
      height={82 / 3}
      width={74 / 3}
    />
  );
}

export function HomeTabIcon({ filled }: TabBarIconProps) {
  return (
    <IconImage
      emptySource={require("@/assets/images/icons/navigation/home-empty.svg")}
      filled={filled}
      filledSource={require("@/assets/images/icons/navigation/home-filled.svg")}
      height={74 / 3}
      width={74 / 3}
    />
  );
}

export function ScanTabIcon({ filled }: TabBarIconProps) {
  return (
    <IconImage
      emptySource={require("@/assets/images/icons/navigation/scan-empty.svg")}
      filled={filled}
      filledSource={require("@/assets/images/icons/navigation/scan-filled.svg")}
      height={74 / 3}
      width={74 / 3}
    />
  );
}
