export type Equipment = 'smith_machine' | 'cable' | 'dumbbell' | 'machine' | 'barbell' | 'bodyweight' | 'kettlebell' | 'other';
export type Muscle = 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'chest' | 'back' | 'lats' | 'traps' | 'shoulders' | 'biceps' | 'triceps' | 'forearms' | 'abs' | 'obliques' | 'hips' | 'other';

export interface Exercise {
  id: string;
  name: string;
  equipment: Equipment[];
  primaryMuscles: Muscle[];
  aliases: string[];
  isUnilateral: boolean;
}

export interface TemplateSet {
  id: string;
  targetWeight_kg: number | null;
  targetReps: number | null;
  note: string | null;
}

export type TemplateBlockType = 'exercise' | 'superset';

export interface TemplateBlock {
  id: string;
  type: TemplateBlockType;
  restSeconds: number | null;
  note: string | null;
  exerciseId?: string;
  sets: TemplateSet[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  defaultRestSeconds: number | null;
  note: string | null;
  estimatedDuration_min: number | null;
  blocks: TemplateBlock[];
  lastUsedAt: string | null;
}

export interface WorkoutSet {
  id: string;
  kg: number | null;
  reps: number | null;
  isWarmup: boolean;
  completedAt: string | null;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  nameSnapshot: string;
  restSeconds: number | null;
  note: string | null;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  title: string;
  templateId: string | null;
  startedAt: string;
  endedAt: string | null;
  defaultRest_seconds: number | null;
  exercises: WorkoutExercise[];
  sessionNote: string | null;
  elapsedSeconds: number;
}