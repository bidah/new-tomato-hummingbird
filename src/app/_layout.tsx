import '../../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import {
  useFonts,
  WorkSans_400Regular,
  WorkSans_500Medium,
  WorkSans_600SemiBold,
  WorkSans_700Bold,
} from '@expo-google-fonts/work-sans';
import { colors } from '../theme';

export default function RootLayout() {
  const [loaded] = useFonts({ WorkSans_400Regular, WorkSans_500Medium, WorkSans_600SemiBold, WorkSans_700Bold });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.neutral }} />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.neutral } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="line/[id]" />
          <Stack.Screen
            name="new"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: [0.62, 1],
              sheetGrabberVisible: true,
              sheetCornerRadius: 28,
            }}
          />
        </Stack>
        <StatusBar style="dark" />
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
