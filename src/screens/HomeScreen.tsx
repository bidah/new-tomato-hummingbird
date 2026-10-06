import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { SymbolView } from 'expo-symbols';
import ContextMenu from 'react-native-context-menu-view';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useStore, type Line } from '../store';
import { aisleIndex } from '../aisles';
import { colors, font, lines, radius, space, type } from '../theme';
import { LineBadge } from '../components/Badges';
import { Tap } from '../components/Tap';
import { Glass } from '../components/Glass';

function RouteStrip({ line }: { line: Line }) {
  const color = lines[line.line].color;
  // Same order as the route on the line screen: by station, then as added.
  const stops = [...line.items].sort((a, b) => aisleIndex(a.aisle) - aisleIndex(b.aisle)).slice(0, 16);
  const next = stops.findIndex((i) => !i.done);
  if (!stops.length) {
    return (
      <View style={styles.strip}>
        <View style={[styles.stripBar, { backgroundColor: colors.hairline }]} />
      </View>
    );
  }
  return (
    <View style={styles.strip}>
      <View style={[styles.stripBar, { backgroundColor: color }]} />
      <View style={styles.stripStops}>
        {stops.map((it, idx) => (
          <View
            key={it.id}
            style={[
              styles.stripStop,
              it.done && { width: 6, height: 6, borderWidth: 0 },
              idx === next && { width: 16, height: 16, borderRadius: 8, borderWidth: 4, borderColor: colors.primary },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function LineCard({ line, onOpen }: { line: Line; onOpen: () => void }) {
  const { removeLine, resetLine } = useStore.getState();
  const left = line.items.filter((i) => !i.done).length;
  const total = line.items.length;
  const done = total > 0 && left === 0;
  return (
    <ContextMenu
      previewBackgroundColor={colors.neutral}
      actions={[
        { title: 'Uncheck all stops', systemIcon: 'arrow.counterclockwise' },
        { title: 'Delete line', systemIcon: 'trash', destructive: true },
      ]}
      onPress={(e) => {
        if (e.nativeEvent.index === 0) resetLine(line.id);
        if (e.nativeEvent.index === 1) removeLine(line.id);
      }}>
      <Tap onPress={onOpen} style={styles.card} pressedStyle={{ opacity: 0.75 }}>
        <View style={styles.cardTop}>
          <LineBadge line={line.line} size={48} />
          <View style={{ flex: 1 }}>
            <Text style={type.h2} numberOfLines={1}>
              {line.name}
            </Text>
            <Text style={[type.label, { marginTop: 4 }]}>
              {lines[line.line].name} line · {total} {total === 1 ? 'stop' : 'stops'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            {done ? (
              <SymbolView name="checkmark.circle.fill" tintColor={lines[line.line].color} size={30} />
            ) : (
              <Text style={styles.count}>{left}</Text>
            )}
            <Text style={[type.label, { fontSize: 9.5 }]}>{done ? 'arrived' : 'left'}</Text>
          </View>
        </View>
        <RouteStrip line={line} />
      </Tap>
    </ContextMenu>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const all = useStore((s) => s.lines);
  const stopsLeft = all.reduce((n, l) => n + l.items.filter((i) => !i.done).length, 0);
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <View style={{ flex: 1, backgroundColor: colors.neutral }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + space.md, paddingBottom: insets.bottom + 120, paddingHorizontal: space.md }}
        showsVerticalScrollIndicator={false}>
        <Text style={type.label}>{today}</Text>
        <Text style={[type.display, { marginTop: 6 }]}>Lines</Text>
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {all.length} {all.length === 1 ? 'line' : 'lines'} running
          </Text>
          <View style={styles.dot} />
          <Text style={styles.summaryText}>{stopsLeft} stops to collect</Text>
        </View>

        <View style={{ gap: 12, marginTop: space.lg - 8 }}>
          {all.map((l, i) => (
            <Animated.View key={l.id} entering={FadeInDown.delay(i * 60)} layout={LinearTransition}>
              <LineCard line={l} onOpen={() => router.push(`/line/${l.id}`)} />
            </Animated.View>
          ))}
          {all.length === 0 && (
            <View style={[styles.card, { alignItems: 'center', paddingVertical: 40 }]}>
              <Text style={type.h2}>No lines running</Text>
              <Text style={[type.body, { color: colors.secondary, marginTop: 4 }]}>Open a line to start a list.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BlurView intensity={40} tint="light" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top }} />

      <View style={[styles.dock, { bottom: insets.bottom + 8 }]} pointerEvents="box-none">
        <Glass style={styles.dockGlass} radius={radius.md + 6} interactive>
          <Tap
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/new');
            }}
            style={styles.primaryBtn} pressedStyle={{ opacity: 0.85 }}>
            <SymbolView name="plus" tintColor={colors.onPrimary} size={16} weight="bold" />
            <Text style={styles.primaryBtnText}>Open new line</Text>
          </Tap>
        </Glass>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  summaryText: { ...type.body, color: colors.secondary },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.faded },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.hairline },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  count: { fontFamily: font.bold, fontSize: 30, lineHeight: 32, letterSpacing: -0.6, color: colors.primary },
  strip: { height: 18, marginTop: 18, justifyContent: 'center' },
  stripBar: { position: 'absolute', left: 0, right: 0, height: 6, borderRadius: 3 },
  stripStops: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2 },
  stripStop: { width: 12, height: 12, borderRadius: 6, borderWidth: 2.5, borderColor: colors.primary, backgroundColor: colors.surface },
  dock: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  dockGlass: { padding: 6 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.tertiary,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  primaryBtnText: { fontFamily: font.semibold, fontSize: 16, color: colors.onPrimary },
});
