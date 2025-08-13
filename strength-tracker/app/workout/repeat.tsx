import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../src/theme/colors';
import { useNavigation, useRouter } from 'expo-router';
import { loadSessions } from '../../src/storage/storage';
import { WorkoutSession } from '../../src/models/types';

export default function RepeatWorkout() {
  const router = useRouter();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    loadSessions().then((s) => setSessions(s.sort((a, b) => (b.startedAt || '').localeCompare(a.startedAt || ''))));
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {sessions.map((s) => (
        <TouchableOpacity key={s.id} onPress={() => router.push({ pathname: '/workout/logger', params: { repeat: s.id } })}>
          <View style={{ padding: 16, borderBottomColor: colors.divider, borderBottomWidth: 1 }}>
            <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{s.title || 'Workout'}</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{new Date(s.startedAt).toLocaleString()}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}