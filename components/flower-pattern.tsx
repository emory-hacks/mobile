import { useState } from "react";
import { Image, StyleSheet, View, type LayoutChangeEvent } from "react-native";

const FLOWER = require("@/assets/images/flower_pattern.png");
const TILE_WIDTH = 52;
const TILE_HEIGHT = 42;

type FlowerPatternProps = {
  radius?: number;
};

export function FlowerPattern({ radius = 24 }: FlowerPatternProps) {
  const [cols, setCols] = useState(0);
  const [rows, setRows] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    const nextCols = Math.ceil(width / TILE_WIDTH);
    const nextRows = Math.ceil(height / TILE_HEIGHT);
    if (nextCols !== cols) setCols(nextCols);
    if (nextRows !== rows) setRows(nextRows);
  };

  return (
    <View
      onLayout={onLayout}
      pointerEvents="none"
      style={[
        styles.clip,
        {
          borderBottomLeftRadius: radius,
          borderBottomRightRadius: radius,
        },
      ]}
    >
      {Array.from({ length: rows }, (_, row) => (
        <View key={row} style={styles.row}>
          {Array.from({ length: cols }, (_, col) => (
            <Image key={col} source={FLOWER} style={styles.tile} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.14,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
  },
  tile: {
    height: TILE_HEIGHT,
    width: TILE_WIDTH,
  },
});
