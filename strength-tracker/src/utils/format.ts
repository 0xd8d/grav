export function secondsToMmSs(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function epley1RM(weightKg: number | null, reps: number | null): string {
  if (!weightKg || !reps) return '–';
  const est = weightKg * (1 + reps / 30);
  return est.toFixed(1);
}