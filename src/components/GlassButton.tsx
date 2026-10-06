import { Host, Button } from '@expo/ui/swift-ui';
import { buttonBorderShape, buttonStyle, controlSize, disabled, font, labelStyle, tint } from '@expo/ui/swift-ui/modifiers';
import type { SFSymbol } from 'expo-symbols';
import { colors } from '../theme';

type Props = {
  label: string;
  systemImage?: SFSymbol;
  onPress: () => void;
  prominent?: boolean;
  iconOnly?: boolean;
  isDisabled?: boolean;
  size?: 'small' | 'regular' | 'large';
};

// Native SwiftUI button with the iOS 26 glass style, tinted with the single accent.
export function GlassButton({ label, systemImage, onPress, prominent = true, iconOnly, isDisabled, size = 'large' }: Props) {
  return (
    <Host matchContents colorScheme="light">
      <Button
        label={label}
        systemImage={systemImage}
        onPress={onPress}
        modifiers={[
          buttonStyle(prominent ? 'glassProminent' : 'glass'),
          controlSize(size),
          tint(colors.tertiary),
          font({ family: 'WorkSans-SemiBold', size: 16 }),
          ...(iconOnly ? [labelStyle('iconOnly'), buttonBorderShape('circle')] : []),
          disabled(!!isDisabled),
        ]}
      />
    </Host>
  );
}
