import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors } from '../../src/theme/colors';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { WorkoutExercise, WorkoutSession, WorkoutSet, WorkoutTemplate } from '../../src/models/types';
import { epley1RM, secondsToMmSs } from '../../src/utils/format';
import { generateId, getLastRestSeconds, loadSessions, loadTemplates, saveSessions, setLastRestSeconds, touchTemplateLastUsed } from '../../src/storage/storage';
import { Ionicons } from '@expo/vector-icons';
import { EXERCISES } from '../../src/data/exercises';
import { pickerEvents } from '../../src/utils/events';

export default function Logger() {
  const { templateId, repeat, pickExercise } = useLocalSearchParams<{ templateId?: string; repeat?: string; pickExercise?: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const [session, setSession] = useState<WorkoutSession>(() => createBlankSession(templateId || null));
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerTarget, setTimerTarget] = useState<number>(90);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const unsubscribe = pickerEvents.on('exercisePicked', ({ exerciseId, context }) => {
      if (context !== 'logger') return;
      const exercise = EXERCISES.find((e) => e.id === exerciseId);
      if (!exercise) return;
      const ex: WorkoutExercise = {
        id: generateId('we'),
        exerciseId: exercise.id,
        nameSnapshot: exercise.name,
        restSeconds: null,
        note: null,
        sets: [newSet(), newSet(), newSet()],
      };
      setSession((s) => ({ ...s, exercises: [...s.exercises, ex] }));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={finishSession}>
          <Text style={{ color: colors.accent, fontWeight: '700' }}>Finish</Text>
        </TouchableOpacity>
      ),
      headerTitle: session.title || 'Workout',
    });
  }, [navigation, session.title]);

  useEffect(() => {
    getLastRestSeconds().then((s) => {
      if (s) setTimerTarget(s);
    });
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      if (repeat) {
        const sessions = await loadSessions();
        const past = sessions.find((s) => s.id === repeat);
        if (past) {
          setSession(buildSessionFromRepeat(past));
          return;
        }
      }
      if (templateId) {
        const templates = await loadTemplates();
        const tpl = templates.find((t) => t.id === templateId);
        if (tpl) {
          setSession(buildSessionFromTemplate(tpl));
        }
      }
    };
    hydrate();
  }, [templateId, repeat]);

  useEffect(() => {
    if (pickExercise) {
      const exercise = EXERCISES.find((e) => e.id === pickExercise);
      if (exercise) {
        const ex: WorkoutExercise = {
          id: generateId('we'),
          exerciseId: exercise.id,
          nameSnapshot: exercise.name,
          restSeconds: null,
          note: null,
          sets: [newSet(), newSet(), newSet()],
        };
        setSession((s) => ({ ...s, exercises: [...s.exercises, ex] }));
        router.setParams({ pickExercise: undefined as unknown as string });
      }
    }
  }, [pickExercise]);

  useEffect(() => {
    const save = async () => {
      const existing = await loadSessions();
      const idx = existing.findIndex((s) => s.id === session.id);
      if (idx >= 0) existing[idx] = session; else existing.push(session);
      await saveSessions(existing);
    };
    save();
  }, [session]);

  function addExercise() {
    router.push({ pathname: '/workout/pick-exercise', params: { returnTo: '/workout/logger', context: 'logger' } });
  }

  function newSet(): WorkoutSet {
    return { id: generateId('ws'), kg: null, reps: null, isWarmup: false, completedAt: null };
  }

  function completeSet(exIdx: number, setIdx: number) {
    setSession((s) => {
      const copy: WorkoutSession = JSON.parse(JSON.stringify(s));
      const target = copy.exercises[exIdx].sets[setIdx];
      if (target.kg != null && target.reps != null) {
        target.completedAt = new Date().toISOString();
        startTimerForExercise(copy.exercises[exIdx]);
      }
      return copy;
    });
  }

  function startTimerForExercise(exercise: WorkoutExercise) {
    const duration = exercise.restSeconds ?? session.defaultRest_seconds ?? timerTarget ?? 90;
    setTimerTarget(duration);
    setLastRestSeconds(duration);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerSeconds(duration);
    timerRef.current = setInterval(() => {
      setTimerSeconds((sec) => {
        if (sec <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return sec - 1;
      });
    }, 1000);
  }

  function finishSession() {
    Alert.alert('Finish Workout', 'Save this session to history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Save',
        style: 'default',
        onPress: async () => {
          const ended = { ...session, endedAt: new Date().toISOString() } as WorkoutSession;
          const existing = await loadSessions();
          const idx = existing.findIndex((s) => s.id === ended.id);
          if (idx >= 0) existing[idx] = ended; else existing.push(ended);
          await saveSessions(existing);
          if (ended.templateId) {
            await touchTemplateLastUsed(ended.templateId);
          }
          router.back();
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ padding: 16 }}>
          <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>Workout Title</Text>
          <TextInput
            value={session.title}
            onChangeText={(t) => setSession((s) => ({ ...s, title: t }))}
            placeholder="Workout"
            placeholderTextColor={colors.textSecondary}
            style={{ color: colors.textPrimary, backgroundColor: colors.input, borderRadius: 8, padding: 12 }}
          />

          <View style={{ height: 12 }} />
          <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>Session Default Rest (seconds)</Text>
          <TextInput
            value={session.defaultRest_seconds ? String(session.defaultRest_seconds) : ''}
            onChangeText={(t) => setSession((s) => ({ ...s, defaultRest_seconds: t ? Number(t) : null }))}
            keyboardType="numeric"
            placeholder="90"
            placeholderTextColor={colors.textSecondary}
            style={{ color: colors.textPrimary, backgroundColor: colors.input, borderRadius: 8, padding: 12 }}
          />

          <View style={{ height: 12 }} />
          <TouchableOpacity onPress={addExercise} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="add-circle" size={20} color={colors.accent} />
            <Text style={{ color: colors.accent, marginLeft: 8, fontWeight: '600' }}>Add Exercise</Text>
          </TouchableOpacity>
        </View>

        {session.exercises.map((ex, exIdx) => (
          <View key={ex.id} style={{ marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.divider, borderRadius: 10, overflow: 'hidden' }}>
            <View style={{ padding: 12, backgroundColor: colors.surfaceAlt, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{ex.nameSnapshot}</Text>
              <Ionicons name="timer-outline" size={18} color={colors.textSecondary} />
            </View>
            <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.surface }}>
              <Text style={{ color: colors.textSecondary, width: 40 }}>SET</Text>
              <Text style={{ color: colors.textSecondary, width: 64 }}>1RM</Text>
              <Text style={{ color: colors.textSecondary, flex: 1 }}>KG × REPS</Text>
            </View>
            {ex.sets.map((st, setIdx) => (
              <View key={st.id} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 }}>
                <Text style={{ color: colors.textPrimary, width: 40 }}>{setIdx + 1}</Text>
                <Text style={{ color: colors.textSecondary, width: 64 }}>{epley1RM(st.kg, st.reps)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <TextInput
                    placeholder="–"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={st.kg != null ? String(st.kg) : ''}
                    onChangeText={(t) =>
                      setSession((s) => {
                        const copy: WorkoutSession = JSON.parse(JSON.stringify(s));
                        const target = copy.exercises[exIdx].sets[setIdx];
                        target.kg = t ? Number(t) : null;
                        return copy;
                      })
                    }
                    style={{ color: colors.textPrimary, backgroundColor: colors.input, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 8, width: 70, marginRight: 8 }}
                  />
                  <Text style={{ color: colors.textSecondary, marginRight: 8 }}>×</Text>
                  <TextInput
                    placeholder="–"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={st.reps != null ? String(st.reps) : ''}
                    onChangeText={(t) =>
                      setSession((s) => {
                        const copy: WorkoutSession = JSON.parse(JSON.stringify(s));
                        const target = copy.exercises[exIdx].sets[setIdx];
                        target.reps = t ? Number(t) : null;
                        return copy;
                      })
                    }
                    style={{ color: colors.textPrimary, backgroundColor: colors.input, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 8, width: 70, marginRight: 8 }}
                  />
                </View>
                <TouchableOpacity onPress={() => completeSet(exIdx, setIdx)}>
                  <Ionicons
                    name={st.kg != null && st.reps != null ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={st.kg != null && st.reps != null ? colors.accent : colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              onPress={() =>
                setSession((s) => {
                  const copy: WorkoutSession = JSON.parse(JSON.stringify(s));
                  copy.exercises[exIdx].sets.push(newSet());
                  return copy;
                })
              }
              style={{ padding: 12, alignItems: 'center', borderTopColor: colors.divider, borderTopWidth: 1 }}
            >
              <Text style={{ color: colors.accent, fontWeight: '600' }}>+ Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, backgroundColor: colors.surface, borderTopColor: colors.divider, borderTopWidth: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              if (timerSeconds > 0) {
                timerRef.current = setInterval(() => {
                  setTimerSeconds((sec) => {
                    if (sec <= 1) {
                      if (timerRef.current) clearInterval(timerRef.current);
                      return 0;
                    }
                    return sec - 1;
                  });
                }, 1000);
              } else {
                setTimerSeconds(timerTarget);
                timerRef.current = setInterval(() => {
                  setTimerSeconds((sec) => (sec <= 1 ? 0 : sec - 1));
                }, 1000);
              }
            }}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Ionicons name="timer-outline" size={20} color={colors.textPrimary} />
            <Text style={{ color: colors.textPrimary, marginLeft: 8, fontWeight: '700' }}>{secondsToMmSs(timerSeconds || timerTarget)}</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="calculator-outline" size={20} color={colors.textSecondary} style={{ marginHorizontal: 8 }} />
            <Ionicons name="stats-chart-outline" size={20} color={colors.textSecondary} style={{ marginHorizontal: 8 }} />
            <Ionicons name="create-outline" size={20} color={colors.textSecondary} style={{ marginHorizontal: 8 }} />
            <Ionicons name="flame-outline" size={20} color={colors.textSecondary} style={{ marginHorizontal: 8 }} />
            <Ionicons name="stopwatch-outline" size={20} color={colors.textSecondary} style={{ marginHorizontal: 8 }} />
          </View>
        </View>
      </View>
    </View>
  );
}

function createBlankSession(templateId: string | null): WorkoutSession {
  return {
    id: generateId('sess'),
    title: 'Workout',
    templateId,
    startedAt: new Date().toISOString(),
    endedAt: null,
    defaultRest_seconds: null,
    exercises: [],
    sessionNote: null,
    elapsedSeconds: 0,
  };
}

function buildSessionFromTemplate(tpl: WorkoutTemplate): WorkoutSession {
  return {
    id: generateId('sess'),
    title: tpl.name,
    templateId: tpl.id,
    startedAt: new Date().toISOString(),
    endedAt: null,
    defaultRest_seconds: tpl.defaultRestSeconds ?? null,
    exercises: tpl.blocks
      .filter((b) => b.type === 'exercise')
      .map((b, idx) => ({
        id: generateId('we'),
        exerciseId: b.exerciseId ?? 'unknown',
        nameSnapshot: EXERCISES.find((e) => e.id === b.exerciseId)?.name ?? `Exercise ${idx + 1}`,
        restSeconds: b.restSeconds,
        note: b.note,
        sets: b.sets.map(() => ({ id: generateId('ws'), kg: null, reps: null, isWarmup: false, completedAt: null })),
      })),
    sessionNote: null,
    elapsedSeconds: 0,
  };
}

function buildSessionFromRepeat(past: WorkoutSession): WorkoutSession {
  return {
    id: generateId('sess'),
    title: past.title,
    templateId: past.templateId,
    startedAt: new Date().toISOString(),
    endedAt: null,
    defaultRest_seconds: past.defaultRest_seconds,
    exercises: past.exercises.map((e) => ({
      id: generateId('we'),
      exerciseId: e.exerciseId,
      nameSnapshot: e.nameSnapshot,
      restSeconds: e.restSeconds,
      note: e.note,
      sets: e.sets.map(() => ({ id: generateId('ws'), kg: null, reps: null, isWarmup: false, completedAt: null })),
    })),
    sessionNote: null,
    elapsedSeconds: 0,
  };
}