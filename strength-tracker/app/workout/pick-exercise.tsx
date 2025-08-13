import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { EXERCISES } from '../../src/data/exercises';
import { colors } from '../../src/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { pickerEvents } from '../../src/utils/events';

export default function PickExercise() {
  const { returnTo, blockId, context } = useLocalSearchParams<{ returnTo?: string; blockId?: string; context?: 'logger' | 'template' }>();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EXERCISES;
    return EXERCISES.filter((e) => e.name.toLowerCase().includes(q) || e.aliases.some((a) => a.toLowerCase().includes(q)));
  }, [query]);

  function onPick(exerciseId: string) {
    const ctx = context ?? (blockId ? 'template' : 'logger');
    pickerEvents.emit('exercisePicked', { exerciseId, context: ctx, blockId });
    if (router.canGoBack()) {
      router.back();
    } else {
      const target = typeof returnTo === 'string' && returnTo.length > 0 ? returnTo : '/workout/logger';
      router.replace({ pathname: target as any, params: { pickExercise: exerciseId, blockId } });
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16 }}>
        <TextInput
          placeholder="Search exercises"
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          style={{ color: colors.textPrimary, backgroundColor: colors.input, borderRadius: 8, padding: 12 }}
        />
      </View>
      <ScrollView style={{ flex: 1 }}>
        {filtered.map((e) => (
          <TouchableOpacity key={e.id} onPress={() => onPick(e.id)}>
            <View style={{ padding: 16, borderBottomColor: colors.divider, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="barbell-outline" size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{e.name}</Text>
                <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{e.primaryMuscles.join(', ')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        ))}
        {filtered.length === 0 ? (
          <View style={{ padding: 24 }}>
            <Text style={{ color: colors.textSecondary }}>No exercises found.</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}