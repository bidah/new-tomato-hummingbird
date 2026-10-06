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
import { colors, font } from '../theme';

export default function RootLayout() {
  const [loaded] = useFonts({ WorkSans_400Regular, WorkSans_500Medium, WorkSans_600SemiBold, WorkSans_700Bold });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.neutral }} />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.neutral },
            headerTransparent: true,
            headerShadowVisible: false,
            headerLargeTitle: true,
            headerLargeTitleShadowVisible: false,
            headerTintColor: colors.primary,
            headerTitleStyle: { fontFamily: font.bold, color: colors.primary },
            headerLargeTitleStyle: { fontFamily: font.bold, color: colors.primary },
            headerBackButtonDisplayMode: 'minimal',
          }}>
          <Stack.Screen name="index" options={{ title: 'Lines' }} />
          <Stack.Screen name="line/[id]" options={{ title: '' }} />
          <Stack.Screen
            name="new"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: [0.62, 1],
              sheetGrabberVisible: true,
              sheetCornerRadius: 28,
              headerShown: false,
            }}
          />
        </Stack>
        <StatusBar style="dark" />
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
