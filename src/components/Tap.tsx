import { useState } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

// Pressable with a static style plus a pressed overlay style. NativeWind's JSX
// interop drops Pressable's function-style form, so press state lives here.
type Props = Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle>; pressedStyle?: StyleProp<ViewStyle> };

export function Tap({ style, pressedStyle = { opacity: 0.75 }, onPressIn, onPressOut, ...rest }: Props) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      {...rest}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      style={[style, pressed && pressedStyle]}
    />
  );
}
