import Svg, { Path, Rect } from "react-native-svg";

type TabBarIconProps = {
  color?: string;
  filled: boolean;
};

const DEFAULT_COLOR = "#A3CE26";

export function CalendarTabIcon({
  color = DEFAULT_COLOR,
  filled,
}: TabBarIconProps) {
  return (
    <Svg width={74 / 3} height={82 / 3} viewBox="0 0 74 82" fill="none">
      <Path
        d="M61.3288 12.6543H12.6712C8.19243 12.6543 4.56165 16.2802 4.56165 20.7531V69.3457C4.56165 73.8185 8.19243 77.4444 12.6712 77.4444H61.3288C65.8076 77.4444 69.4384 73.8185 69.4384 69.3457V20.7531C69.4384 16.2802 65.8076 12.6543 61.3288 12.6543Z"
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.7808 20.7532V4.55566M53.2191 20.7532V4.55566"
        stroke={color}
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.7808 61.2471V57.1978M37 61.2471V57.1978M53.2191 61.2471V57.1978M20.7808 45.0494V41M37 45.0494V41M53.2191 45.0494V41"
        stroke={filled ? "#FFFFFF" : color}
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function HomeTabIcon({
  color = DEFAULT_COLOR,
  filled,
}: TabBarIconProps) {
  return (
    <Svg
      width={74 / 3}
      height={74 / 3}
      viewBox="0 0 82 77"
      fill="none"
      preserveAspectRatio="none"
    >
      <Path
        d="M68.5 29.375V68.495C68.5 70.705 66.71 72.495 64.5 72.495H56.5C54.29 72.495 52.5 70.705 52.5 68.495V60.495C52.5 56.075 48.92 52.495 44.5 52.495H36.5C32.08 52.495 28.5 56.075 28.5 60.495V68.495C28.5 70.705 26.71 72.495 24.5 72.495H16.5C14.29 72.495 12.5 70.705 12.5 68.495V29.375M4.5 36.495L35.19 6.705C38.22 3.765 42.79 3.765 45.82 6.705L76.51 36.495"
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ScanTabIcon({
  color = DEFAULT_COLOR,
  filled,
}: TabBarIconProps) {
  return (
    <Svg width={74 / 3} height={74 / 3} viewBox="0 0 74 74" fill="none">
      <Path
        d="M4.56152 28.8903V12.6711C4.56152 8.19056 8.19056 4.56152 12.6711 4.56152H28.8903M69.4384 28.8903V12.6711C69.4384 8.19056 65.8093 4.56152 61.3288 4.56152H45.1096M4.56152 45.1094V61.3286C4.56152 65.8091 8.19056 69.4381 12.6711 69.4381H28.8903M69.4384 45.1094V61.3286C69.4384 65.8091 65.8093 69.4381 61.3288 69.4381H45.1096"
        stroke={color}
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {filled && (
        <Rect x={17} y={17} width={40} height={40} rx={10} fill={color} />
      )}
    </Svg>
  );
}
