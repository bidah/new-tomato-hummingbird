import { Text, View } from 'react-native';
import { colors, font, lines, type LineKey } from '../theme';

// Round line roundel, as on Tokyo Metro maps.
export function LineBadge({ line, size = 44 }: { line: LineKey; size?: number }) {
  const ring = Math.max(4, Math.round(size * 0.14));
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: ring,
        borderColor: lines[line].color,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ fontFamily: font.bold, fontSize: size * 0.42, color: colors.primary, marginTop: -1 }}>{line}</Text>
    </View>
  );
}

// Rounded-square station number: line letter over a two-digit stop.
export function StationBadge({ line, n, size = 40 }: { line: LineKey; n: number; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        borderWidth: Math.max(3, size * 0.1),
        borderColor: lines[line].color,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ fontFamily: font.bold, fontSize: size * 0.26, lineHeight: size * 0.3, color: colors.primary }}>{line}</Text>
      <Text style={{ fontFamily: font.bold, fontSize: size * 0.34, lineHeight: size * 0.36, color: colors.primary }}>
        {String(n).padStart(2, '0')}
      </Text>
    </View>
  );
}
