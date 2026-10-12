/*
Mainly for finding urls in schedule text and rendering properly
*/
import { Linking, Text, type TextProps, type TextStyle } from "react-native";
import Animated from "react-native-reanimated";

function splitTrailingPunctuation(value: string) {
  const match = value.match(/^(.*?)([.,;:!?)\]]+)$/);
  if (!match) return { url: value, trailing: "" };
  return { url: match[1], trailing: match[2] };
}

const linkStyle: TextStyle = {
  color: "blue",
  textDecorationLine: "underline",
};

export function LinkedText({ children, ...rest }: TextProps) {
  const text = typeof children === "string" ? children : "";
  const parts = text.split(/(https?:\/\/[^\s]+)/gi);

  return (
    <Animated.Text {...rest}>
      {parts.map((part, index) => {
        if (!/^https?:\/\//i.test(part)) return part;

        const { url, trailing } = splitTrailingPunctuation(part);
        return (
          <Text key={`${index}-${url}`}>
            <Text
              onPress={(event) => {
                event.stopPropagation();
                void Linking.openURL(url);
              }}
              style={linkStyle}
            >
              {url}
            </Text>
            {trailing}
          </Text>
        );
      })}
    </Animated.Text>
  );
}
