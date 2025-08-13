import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { ListItem } from '../../src/components/ListItem';
import { Section } from '../../src/components/Section';
import { Ionicons } from '@expo/vector-icons';
import { loadTemplates } from '../../src/storage/storage';
import { WorkoutTemplate } from '../../src/models/types';

export default function TemplatePicker() {
  const router = useRouter();
  const navigation = useNavigation();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [sort, setSort] = useState<'name' | 'last' | 'duration'>('name');

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => router.push('/templates/new')}>
          <Ionicons name="add" size={22} color={colors.accent} />
        </TouchableOpacity>
      ),
      headerTitle: 'Select Template',
    });
  }, [navigation, router]);

  useEffect(() => {
    loadTemplates().then(setTemplates);
  }, []);

  const sorted = useMemo(() => {
    const t = [...templates];
    if (sort === 'name') t.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'last') t.sort((a, b) => (b.lastUsedAt ?? '').localeCompare(a.lastUsedAt ?? ''));
    if (sort === 'duration') t.sort((a, b) => (a.estimatedDuration_min ?? 0) - (b.estimatedDuration_min ?? 0));
    return t;
  }, [templates, sort]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.push('/templates/new')}>
          <View style={{ backgroundColor: colors.accent, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
            <Text style={{ color: 'white', fontWeight: '600' }}>New Template</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSort((s) => (s === 'name' ? 'last' : s === 'last' ? 'duration' : 'name'))}>
          <Text style={{ color: colors.textSecondary }}>Sort: {sort === 'name' ? 'Name ▾' : sort === 'last' ? 'Last Used ▾' : 'Duration ▾'}</Text>
        </TouchableOpacity>
      </View>

      <Section>
        {sorted.map((t, idx) => (
          <View key={t.id}>
            <ListItem
              icon="document-text-outline"
              title={t.name}
              subtitle={templateSubtitle(t)}
              onPress={() => router.push({ pathname: '/workout/logger', params: { templateId: t.id } })}
              right={<Ionicons name="information-circle-outline" size={20} color={colors.accent} />}
            />
            {idx < sorted.length - 1 ? <View style={{ height: 1, backgroundColor: colors.divider }} /> : null}
          </View>
        ))}
      </Section>
    </ScrollView>
  );
}

function templateSubtitle(t: WorkoutTemplate): string {
  const exercises = t.blocks.filter((b) => b.type === 'exercise').length;
  const duration = t.estimatedDuration_min ? `${t.estimatedDuration_min} min` : '—';
  const last = t.lastUsedAt ? timeAgo(new Date(t.lastUsedAt)) : 'Never';
  return `${exercises} exercises  •  ${duration}  •  Last: ${last}`;
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}