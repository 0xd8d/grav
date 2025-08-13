import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutTemplate, WorkoutSession } from '../models/types';

const KEYS = {
  templates: 'st.templates',
  sessions: 'st.sessions',
  lastRestSeconds: 'st.lastRestSeconds',
} as const;

export async function loadTemplates(): Promise<WorkoutTemplate[]> {
  const raw = await AsyncStorage.getItem(KEYS.templates);
  return raw ? (JSON.parse(raw) as WorkoutTemplate[]) : [];
}

export async function saveTemplates(templates: WorkoutTemplate[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.templates, JSON.stringify(templates));
}

export async function touchTemplateLastUsed(templateId: string): Promise<void> {
  const templates = await loadTemplates();
  const idx = templates.findIndex((t) => t.id === templateId);
  if (idx >= 0) {
    templates[idx] = { ...templates[idx], lastUsedAt: new Date().toISOString() };
    await saveTemplates(templates);
  }
}

export async function loadSessions(): Promise<WorkoutSession[]> {
  const raw = await AsyncStorage.getItem(KEYS.sessions);
  return raw ? (JSON.parse(raw) as WorkoutSession[]) : [];
}

export async function saveSessions(sessions: WorkoutSession[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.sessions, JSON.stringify(sessions));
}

export async function getLastRestSeconds(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(KEYS.lastRestSeconds);
  return raw ? Number(raw) : null;
}

export async function setLastRestSeconds(seconds: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.lastRestSeconds, String(seconds));
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}