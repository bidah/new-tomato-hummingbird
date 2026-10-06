import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import ContextMenu from 'react-native-context-menu-view';
import * as Haptics from 'expo-haptics';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import Animated, {
  FadeIn,
  FadeInDown,
  LinearTransition,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useLine, useStore, type Item, type Line } from '../store';
import { aisles, aisleIndex } from '../aisles';
import { colors, font, lines, radius, space, type } from '../theme';
import { LineBadge, StationBadge } from '../components/Badges';
import { Tap } from '../components/Tap';
import { Glass } from '../components/Glass';
import { GlassButton } from '../components/GlassButton';
import { Confetti } from '../components/Confetti';

const RAIL = 56; // width of the left column that carries the line

function Pulse({ color }: { color: string }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }), -1, false);
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: 0.45 * (1 - p.value), transform: [{ scale: 1 + p.value * 1.1 }] }));
  return <Animated.View style={[styles.pulse, { backgroundColor: color }, style]} />;
}

function Stop({ item, line, isNext, onToggle }: { item: Item; line: Line; isNext: boolean; onToggle: () => void }) {
  const { removeItem, moveItem } = useStore.getState();
  const color = lines[line.line].color;
  return (
    <ContextMenu
      previewBackgroundColor={colors.surface}
      actions={[
        {
          title: 'Move to station',
          systemIcon: 'arrow.triangle.branch',
          actions: aisles.map((a) => ({ title: a.name, systemIcon: a.symbol, selected: a.key === item.aisle })),
        },
        { title: 'Remove stop', systemIcon: 'trash', destructive: true },
      ]}
      onPress={(e) => {
        const [top, sub] = e.nativeEvent.indexPath ?? [e.nativeEvent.index];
        if (top === 0 && sub !== undefined) moveItem(line.id, item.id, aisles[sub].key);
        if (top === 1) removeItem(line.id, item.id);
      }}>
      <Tap onPress={onToggle} style={styles.stopRow} pressedStyle={{ backgroundColor: '#F1F1F1' }}>
        <View style={styles.rail}>
          <View style={[styles.railBar, { backgroundColor: color }]} />
          {isNext && <Pulse color={color} />}
          <View
            style={[
              styles.stopDot,
              { borderColor: isNext ? colors.primary : color },
              item.done && { backgroundColor: color, borderColor: color },
            ]}>
            {item.done && (
              <Animated.View entering={ZoomIn.springify()}>
                <SymbolView name="checkmark" tintColor={colors.onPrimary} size={10} weight="black" />
              </Animated.View>
            )}
          </View>
        </View>
        <View style={styles.stopBody}>
          <Text
            style={[
              styles.stopName,
              item.done && { color: colors.faded, textDecorationLine: 'line-through' },
              isNext && { fontFamily: font.semibold },
            ]}
            numberOfLines={2}>
            {item.name}
          </Text>
          {item.qty ? (
            <View style={[styles.qty, item.done && { opacity: 0.4 }]}>
              <Text style={styles.qtyText}>{item.qty}</Text>
            </View>
          ) : null}
        </View>
      </Tap>
    </ContextMenu>
  );
}

export default function LineScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const line = useLine(id);
  const insets = useSafeAreaInsets();
  const { toggleItem, addItems, clearDone, resetLine, removeLine } = useStore.getState();
  const [draft, setDraft] = useState('');
  const [burst, setBurst] = useState(0);
  const input = useRef<TextInput>(null);

  const stations = useMemo(() => {
    if (!line) return [];
    return aisles
      .map((a) => ({ aisle: a, n: aisleIndex(a.key) + 1, items: line.items.filter((i) => i.aisle === a.key) }))
      .filter((s) => s.items.length);
  }, [line]);

  if (!line) return <View style={{ flex: 1, backgroundColor: colors.neutral }} />;

  const color = lines[line.line].color;
  const ordered = stations.flatMap((s) => s.items);
  const next = ordered.find((i) => !i.done);
  const nextStation = next ? stations.find((s) => s.items.includes(next)) : undefined;
  const total = line.items.length;
  const left = line.items.filter((i) => !i.done).length;
  const arrived = total > 0 && left === 0;

  const toggle = (item: Item) => {
    const willFinish = !item.done && left === 1;
    toggleItem(line.id, item.id);
    if (willFinish) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setBurst((b) => b + 1);
    } else {
      Haptics.impactAsync(item.done ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const submit = () => {
    if (!draft.trim()) return;
    addItems(line.id, draft);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    setDraft('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.neutral }}>
      <Stack.Screen options={{ title: line.name }} />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu icon="ellipsis">
          <Stack.Toolbar.MenuAction icon="arrow.counterclockwise" onPress={() => resetLine(line.id)}>
            Uncheck all stops
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction icon="checkmark.circle" onPress={() => clearDone(line.id)}>
            Clear collected stops
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            icon="trash"
            destructive
            onPress={() => {
              router.back();
              setTimeout(() => removeLine(line.id), 350);
            }}>
            Delete line
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      <ScrollView
        keyboardDismissMode="on-drag"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: insets.bottom + 140 }}>
        {/* Signage */}
        <View style={{ paddingHorizontal: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <LineBadge line={line.line} size={40} />
            <Text style={type.label}>{lines[line.line].name} line</Text>
          </View>
          <View style={styles.progressRow}>
            <Text style={[type.label, { color: colors.primary }]}>
              {total === 0 ? 'Empty line' : arrived ? 'All stops collected' : `${left} of ${total} stops left`}
            </Text>
            <Text style={type.label}>{total ? Math.round(((total - left) / total) * 100) : 0}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View
              layout={LinearTransition}
              style={{ width: `${total ? ((total - left) / total) * 100 : 0}%`, height: '100%', backgroundColor: color }}
            />
          </View>

          {next && nextStation && (
            <Animated.View entering={FadeIn} key={next.id} style={styles.nextSign}>
              <View style={{ flex: 1 }}>
                <Text style={[type.label, { color: '#9A9A9A' }]}>Next stop</Text>
                <Text style={styles.nextName} numberOfLines={1}>
                  {next.name}
                </Text>
                <Text style={[type.label, { color: '#9A9A9A', marginTop: 2 }]}>
                  {nextStation.aisle.name}
                </Text>
              </View>
              <StationBadge line={line.line} n={nextStation.n} size={46} />
            </Animated.View>
          )}
        </View>

        {/* Route */}
        <View style={{ marginTop: space.lg - 8 }}>
          {stations.map((s, si) => (
            <Animated.View key={s.aisle.key} layout={LinearTransition} entering={FadeInDown.delay(si * 40)}>
              <View style={styles.stationRow}>
                <View style={styles.rail}>
                  <View style={[styles.railBar, { backgroundColor: color, top: si === 0 ? '50%' : 0 }]} />
                  <StationBadge line={line.line} n={s.n} size={38} />
                </View>
                <View style={styles.stationBody}>
                  <Text style={type.h2}>{s.aisle.name}</Text>
                  <SymbolView name={s.aisle.symbol} tintColor={colors.secondary} size={16} />
                  <View style={{ flex: 1 }} />
                  <Text style={type.label}>
                    {s.items.filter((i) => i.done).length}/{s.items.length}
                  </Text>
                </View>
              </View>
              {s.items.map((it) => (
                <Animated.View key={it.id} layout={LinearTransition} entering={FadeIn}>
                  <Stop item={it} line={line} isNext={it.id === next?.id} onToggle={() => toggle(it)} />
                </Animated.View>
              ))}
            </Animated.View>
          ))}

          {/* Terminal */}
          {total > 0 && (
            <View style={styles.stationRow}>
              <View style={styles.rail}>
                <View style={[styles.railBar, { backgroundColor: color, bottom: '50%' }]} />
                <View style={[styles.terminal, { borderColor: color }]} />
              </View>
              <View style={styles.stationBody}>
                <Text style={[type.label, { color: colors.primary }]}>{arrived ? 'Terminal · arrived' : 'Terminal · checkout'}</Text>
              </View>
            </View>
          )}

          {arrived && (
            <Animated.View entering={ZoomIn.springify().damping(14)} style={[styles.arrivedCard, { borderColor: color }]}>
              <SymbolView name="flag.checkered" tintColor={colors.primary} size={26} />
              <View style={{ flex: 1 }}>
                <Text style={type.h2}>End of the line</Text>
                <Text style={[type.body, { color: colors.secondary }]}>Every stop collected. Head to checkout.</Text>
              </View>
            </Animated.View>
          )}

          {total === 0 && (
            <View style={styles.empty}>
              <View style={[styles.emptyRail, { backgroundColor: color }]} />
              <Text style={[type.h2, { marginTop: 18 }]}>No stops yet</Text>
              <Text style={[type.body, { color: colors.secondary, textAlign: 'center', marginTop: 4 }]}>
                Type a few items below — separate them{'\n'}with commas. They'll sort into stations.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <KeyboardStickyView style={styles.composerWrap} offset={{ closed: 0, opened: insets.bottom - 8 }}>
        <View style={{ paddingBottom: insets.bottom + 8, paddingHorizontal: 12 }}>
          <Glass radius={radius.lg + 10} tint="rgba(255,255,255,0.55)" style={styles.composer}>
            <SymbolView name="plus.circle" tintColor={colors.secondary} size={20} style={{ marginLeft: 6 }} />
            <TextInput
              ref={input}
              value={draft}
              onChangeText={setDraft}
              placeholder="Add stops — 2 limes, oat milk, bread"
              placeholderTextColor="#8A8A8A"
              style={styles.input}
              returnKeyType="done"
              autoComplete="off"
              textContentType="none"
              autoCorrect={false}
              submitBehavior="submit"
              onSubmitEditing={submit}
            />
            <GlassButton label="Add" systemImage="arrow.up" iconOnly size="regular" onPress={submit} isDisabled={!draft.trim()} />
          </Glass>
        </View>
      </KeyboardStickyView>

      {burst > 0 && <Confetti key={burst} />}
    </View>
  );
}

const styles = StyleSheet.create({
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  progressTrack: { height: 6, backgroundColor: colors.hairline, borderRadius: radius.sm, overflow: 'hidden', marginTop: 8 },
  nextSign: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  nextName: { fontFamily: font.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.3, color: colors.onPrimary, marginTop: 4 },
  rail: { width: RAIL, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  railBar: { position: 'absolute', top: 0, bottom: 0, width: 6 },
  stationRow: { flexDirection: 'row', alignItems: 'center', minHeight: 64, paddingRight: space.md, marginLeft: 6 },
  stationBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8 },
  stopRow: { flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingRight: space.md, marginLeft: 6 },
  stopDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 4,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: { position: 'absolute', width: 20, height: 20, borderRadius: 10 },
  stopBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  stopName: { ...type.body, fontSize: 16, flex: 1, fontFamily: font.medium },
  qty: { borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  qtyText: { fontFamily: font.bold, fontSize: 12, color: colors.primary },
  terminal: { width: 26, height: 26, borderRadius: 4, borderWidth: 6, backgroundColor: colors.surface },
  arrivedCard: {
    marginHorizontal: space.md,
    marginTop: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: 20,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  empty: { alignItems: 'center', paddingHorizontal: space.lg, paddingTop: 12 },
  emptyRail: { width: 6, height: 70, borderRadius: 3 },
  composerWrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  composer: { flexDirection: 'row', alignItems: 'center', padding: 6, gap: 6 },
  input: { flex: 1, height: 40, fontFamily: font.regular, fontSize: 16, color: colors.primary },
});
