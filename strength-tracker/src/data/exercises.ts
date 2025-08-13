import { Exercise } from '../models/types';
import { generateId } from '../storage/storage';

export const EXERCISES: Exercise[] = [
  { id: generateId('ex'), name: 'Barbell Squat', equipment: ['barbell'], primaryMuscles: ['quads', 'glutes'], aliases: [], isUnilateral: false },
  { id: generateId('ex'), name: 'Deadlift', equipment: ['barbell'], primaryMuscles: ['hamstrings', 'glutes', 'back'], aliases: [], isUnilateral: false },
  { id: generateId('ex'), name: 'Bench Press', equipment: ['barbell'], primaryMuscles: ['chest', 'triceps'], aliases: [], isUnilateral: false },
  { id: generateId('ex'), name: 'Dumbbell Row', equipment: ['dumbbell'], primaryMuscles: ['back'], aliases: [], isUnilateral: true },
  { id: generateId('ex'), name: 'Overhead Press', equipment: ['barbell'], primaryMuscles: ['shoulders', 'triceps'], aliases: [], isUnilateral: false },
  { id: generateId('ex'), name: 'Lat Pulldown', equipment: ['machine'], primaryMuscles: ['lats'], aliases: [], isUnilateral: false },
];