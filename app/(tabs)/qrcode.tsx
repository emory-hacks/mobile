import { Image, View, useWindowDimensions } from "react-native";

export default function QRCodeScreen() {
  const { width, height } = useWindowDimensions();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Image
        source={require("../../assets/images/sample_qr_code.png")}
        style={{
          width: 0.5 * width,
          height: 0.3 * height,
        }}
      />
    </View>
  );
}
