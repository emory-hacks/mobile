import {
  Image,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type DefaultPfpProps = {
  accessibilityLabel?: string;
  size: number;
  style?: StyleProp<ViewStyle>;
};

export function DefaultPfp({
  accessibilityLabel = "Profile picture",
  size,
  style,
}: DefaultPfpProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.clip,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <Image
        source={require("@/assets/images/default_pfp.png")}
        style={{ width: size, height: size }}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: "hidden",
  },
});
