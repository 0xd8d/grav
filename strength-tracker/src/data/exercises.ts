import { Exercise } from '../models/types';

export const EXERCISES: Exercise[] = [
  { id: 'ex_barbell_squat', name: 'Barbell Squat', equipment: ['barbell'], primaryMuscles: ['quads', 'glutes'], aliases: [], isUnilateral: false },
  { id: 'ex_deadlift', name: 'Deadlift', equipment: ['barbell'], primaryMuscles: ['hamstrings', 'glutes', 'back'], aliases: [], isUnilateral: false },
  { id: 'ex_bench_press', name: 'Bench Press', equipment: ['barbell'], primaryMuscles: ['chest', 'triceps'], aliases: [], isUnilateral: false },
  { id: 'ex_dumbbell_row', name: 'Dumbbell Row', equipment: ['dumbbell'], primaryMuscles: ['back'], aliases: [], isUnilateral: true },
  { id: 'ex_overhead_press', name: 'Overhead Press', equipment: ['barbell'], primaryMuscles: ['shoulders', 'triceps'], aliases: [], isUnilateral: false },
  { id: 'ex_lat_pulldown', name: 'Lat Pulldown', equipment: ['machine'], primaryMuscles: ['lats'], aliases: [], isUnilateral: false },
];