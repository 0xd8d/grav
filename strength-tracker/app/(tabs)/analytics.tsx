import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../src/theme/colors';

export default function Analytics() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.textSecondary }}>Analytics coming soon</Text>
    </View>
  );
}