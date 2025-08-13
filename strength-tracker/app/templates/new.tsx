import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors } from '../../src/theme/colors';
import { useNavigation, useRouter } from 'expo-router';
import { generateId, loadTemplates, saveTemplates } from '../../src/storage/storage';
import { TemplateBlock, TemplateSet, WorkoutTemplate } from '../../src/models/types';
import { Ionicons } from '@expo/vector-icons';
import { EXERCISES } from '../../src/data/exercises';
import { pickerEvents } from '../../src/utils/events';

export default function NewTemplate() {
  const router = useRouter();
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [defaultRest, setDefaultRest] = useState<string>('');
  const [note, setNote] = useState('');
  const [blocks, setBlocks] = useState<TemplateBlock[]>([]);
  const [pendingBlockId, setPendingBlockId] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={onSave}>
          <Text style={{ color: colors.accent, fontWeight: '700' }}>Save</Text>
        </TouchableOpacity>
      ),
      headerTitle: name ? name : 'New Template',
    });
  }, [navigation, name]);

  useEffect(() => {
    const unsubscribe = pickerEvents.on('exercisePicked', ({ exerciseId, context, blockId }) => {
      if (context !== 'template' || !blockId) return;
      setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, exerciseId } : b)));
    });
    return unsubscribe;
  }, []);

  function addExerciseBlock() {
    const block: TemplateBlock = {
      id: generateId('tb'),
      type: 'exercise',
      restSeconds: null,
      note: null,
      exerciseId: undefined,
      sets: defaultSets(),
    };
    setBlocks((b) => [...b, block]);
  }

  function defaultSets(): TemplateSet[] {
    return [1, 2, 3].map(() => ({ id: generateId('ts'), targetWeight_kg: null, targetReps: null, note: null }));
  }

  function onPickExercise(blockId: string) {
    setPendingBlockId(blockId);
    router.push({ pathname: '/workout/pick-exercise', params: { returnTo: '/templates/new', blockId, context: 'template' } });
  }

  async function onSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Please enter a template name.');
      return;
    }
    const existing = await loadTemplates();
    const template: WorkoutTemplate = {
      id: generateId('tpl'),
      name: trimmed,
      defaultRestSeconds: defaultRest ? Number(defaultRest) : null,
      note: note || null,
      estimatedDuration_min: estimateDuration(blocks, defaultRest ? Number(defaultRest) : null),
      blocks,
      lastUsedAt: null,
    };
    await saveTemplates([...existing, template]);
    router.replace('/templates');
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>Name</Text>
      <TextInput
        placeholder="e.g., Push Day"
        placeholderTextColor={colors.textSecondary}
        value={name}
        onChangeText={setName}
        style={{ color: colors.textPrimary, backgroundColor: colors.input, borderRadius: 8, padding: 12, marginBottom: 16 }}
      />

      <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>Rest Time (seconds) — optional</Text>
      <TextInput
        placeholder="e.g., 120"
        keyboardType="numeric"
        placeholderTextColor={colors.textSecondary}
        value={defaultRest}
        onChangeText={setDefaultRest}
        style={{ color: colors.textPrimary, backgroundColor: colors.input, borderRadius: 8, padding: 12, marginBottom: 16 }}
      />

      <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>Note (optional)</Text>
      <TextInput
        placeholder="Describe this template"
        placeholderTextColor={colors.textSecondary}
        value={note}
        onChangeText={setNote}
        multiline
        style={{ color: colors.textPrimary, backgroundColor: colors.input, borderRadius: 8, padding: 12, minHeight: 80 }}
      />

      <View style={{ height: 20 }} />
      <TouchableOpacity onPress={addExerciseBlock} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="add-circle" size={20} color={colors.accent} />
        <Text style={{ color: colors.accent, marginLeft: 8, fontWeight: '600' }}>Add Exercise</Text>
      </TouchableOpacity>

      {blocks.map((b) => {
        const selected = EXERCISES.find((e) => e.id === b.exerciseId);
        return (
          <View key={b.id} style={{ marginTop: 16, padding: 12, backgroundColor: colors.surfaceAlt, borderRadius: 10, borderWidth: 1, borderColor: colors.divider }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '700', marginBottom: 8 }}>Exercise</Text>
              <TouchableOpacity onPress={() => onPickExercise(b.id)}>
                <Text style={{ color: colors.accent, fontWeight: '600' }}>{selected ? 'Change' : 'Pick'} Exercise</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: selected ? colors.textPrimary : colors.textSecondary, marginBottom: 8 }}>
              {selected ? selected.name : 'No exercise selected'}
            </Text>
            {b.sets.map((s) => (
              <View key={s.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ color: colors.textSecondary }}>kg × reps</Text>
                <Text style={{ color: colors.textSecondary }}>— × —</Text>
              </View>
            ))}
          </View>
        );
      })}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function estimateDuration(blocks: TemplateBlock[], defaultRest: number | null): number | null {
  if (!blocks.length) return null;
  const avgSetSeconds = 35; // default 30–40s
  let total = 0;
  for (const b of blocks) {
    const setCount = b.sets.length;
    const rest = b.restSeconds ?? defaultRest ?? 90;
    total += (avgSetSeconds + rest) * setCount;
  }
  const minutes = Math.round(total / 60 / 5) * 5; // nearest 5 minutes
  return minutes || null;
}