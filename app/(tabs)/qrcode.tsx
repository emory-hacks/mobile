import {
  Image,
  Text,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";

export default function QRCodeScreen() {
  const { width, height } = useWindowDimensions();
  let colorScheme = useColorScheme();
  return (
    <View style={{ flex: 1 }}>
      <View style={{ alignItems: "center", padding: 45 }}>
        <Text
          style={{
            color: colorScheme === "dark" ? "white" : "black",
            fontSize: 25,
          }}
        >
          Show your QR
        </Text>
      </View>
      <View
        style={{ flex: 0.8, alignItems: "center", justifyContent: "center" }}
      >
        <Image
          source={require("../../assets/images/sample_qr_code.png")}
          style={{
            width: 0.55 * width,
            height: 0.3 * height,
          }}
        />
      </View>
    </View>
  );
}
