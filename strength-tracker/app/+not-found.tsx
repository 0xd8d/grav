import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../src/theme/colors';

export default function NotFound() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '700' }}>Screen not found</Text>
    </View>
  );
}