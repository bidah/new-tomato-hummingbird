import { StyleSheet, View, type ViewProps } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { BlurView } from 'expo-blur';

const liquid = isLiquidGlassAvailable();

type Props = ViewProps & { interactive?: boolean; tint?: string; radius?: number };

// iOS 26 Liquid Glass, with a frosted blur on older systems.
export function Glass({ interactive, tint, radius = 999, style, children, ...rest }: Props) {
  if (liquid) {
    return (
      <GlassView
        glassEffectStyle="regular"
        colorScheme="light"
        isInteractive={interactive}
        tintColor={tint}
        style={[{ borderRadius: radius, overflow: 'hidden' }, style]}
        {...rest}>
        {children}
      </GlassView>
    );
  }
  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden' }, style]} {...rest}>
      <BlurView intensity={60} tint="systemChromeMaterialLight" style={StyleSheet.absoluteFill} />
      {tint ? <View style={[StyleSheet.absoluteFill, { backgroundColor: tint, opacity: 0.85 }]} /> : null}
      {children}
    </View>
  );
}
