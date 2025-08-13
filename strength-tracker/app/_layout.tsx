import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { colors } from '../src/theme/colors';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={Platform.OS === 'android' ? 'light' : 'light'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="templates/index" options={{ title: 'Select Template' }} />
        <Stack.Screen name="templates/new" options={{ title: 'New Template' }} />
        <Stack.Screen name="workout/logger" options={{ title: 'Workout' }} />
        <Stack.Screen name="workout/repeat" options={{ title: 'Repeat Workout' }} />
        <Stack.Screen name="workout/pick-exercise" options={{ title: 'Pick Exercise' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}