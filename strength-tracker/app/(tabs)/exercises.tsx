import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { colors } from '../../src/theme/colors';
import { EXERCISES } from '../../src/data/exercises';

export default function Exercises() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {EXERCISES.map((e) => (
        <View key={e.id} style={{ padding: 16, borderBottomColor: colors.divider, borderBottomWidth: 1 }}>
          <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{e.name}</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{e.primaryMuscles.join(', ')}</Text>
        </View>
      ))}
    </ScrollView>
  );
}