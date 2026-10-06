import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useStore } from '../store';
import { colors, font, lines, radius, space, type, type LineKey } from '../theme';
import { Tap } from '../components/Tap';
import { LineBadge } from '../components/Badges';

const keys = Object.keys(lines) as LineKey[];

function Swatch({ k, selected, onPress }: { k: LineKey; selected: boolean; onPress: () => void }) {
  const style = useAnimatedStyle(() => ({ transform: [{ scale: withSpring(selected ? 1.12 : 1, { damping: 12 }) }] }));
  return (
    <Tap onPress={onPress} style={styles.swatch}>
      <Animated.View style={[styles.ring, selected && { borderColor: colors.primary }, style]}>
        <LineBadge line={k} size={50} />
      </Animated.View>
      <Text style={[type.label, { fontSize: 9.5, marginTop: 6 }, selected && { color: colors.primary }]}>{lines[k].name}</Text>
    </Tap>
  );
}

export default function NewLineScreen() {
  const router = useRouter();
  const addLine = useStore((s) => s.addLine);
  const all = useStore((s) => s.lines);
  const used = all.map((l) => l.line);
  const [name, setName] = useState('');
  const [line, setLine] = useState<LineKey>(keys.find((k) => !used.includes(k)) ?? 'T');

  const open = () => {
    const id = addLine(name.trim() || `${lines[line].name} run`, line);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
    router.push(`/line/${id}`);
  };

  return (
    <View style={styles.root}>
      <Text style={type.label}>New line</Text>
      <TextInput
        autoFocus
        value={name}
        onChangeText={setName}
        placeholder="Line name"
        placeholderTextColor={colors.faded}
        style={styles.name}
        returnKeyType="go"
        onSubmitEditing={open}
      />
      <Text style={[type.label, { marginTop: space.md }]}>Route colour</Text>
      <View style={styles.grid}>
        {keys.map((k) => (
          <Swatch
            key={k}
            k={k}
            selected={k === line}
            onPress={() => {
              Haptics.selectionAsync();
              setLine(k);
            }}
          />
        ))}
      </View>
      <Tap onPress={open} style={styles.btn} pressedStyle={{ opacity: 0.85 }}>
        <Text style={styles.btnText}>Open line</Text>
      </Tap>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.neutral, padding: 24, paddingTop: 30 },
  name: { ...type.h1, fontFamily: font.bold, paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: colors.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14, marginTop: 14 },
  ring: { padding: 3, borderRadius: 99, borderWidth: 2.5, borderColor: 'transparent' },
  swatch: { width: '31%', alignItems: 'center', paddingVertical: 6 },
  btn: { marginTop: space.lg, backgroundColor: colors.tertiary, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center' },
  btnText: { fontFamily: font.semibold, fontSize: 16, color: colors.onPrimary },
});
