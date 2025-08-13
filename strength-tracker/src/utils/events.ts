type Listener<T> = (payload: T) => void;

export class SimpleEventEmitter<TMap extends Record<string, any>> {
  private listeners: { [K in keyof TMap]?: Set<Listener<TMap[K]>> } = {};

  on<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): () => void {
    const set = (this.listeners[event] ??= new Set());
    set.add(listener);
    return () => this.off(event, listener);
  }

  off<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): void {
    const set = this.listeners[event];
    if (set) set.delete(listener);
  }

  emit<K extends keyof TMap>(event: K, payload: TMap[K]): void {
    const set = this.listeners[event];
    if (!set) return;
    for (const listener of Array.from(set)) {
      try {
        listener(payload);
      } catch {}
    }
  }
}

export type PickerEvents = {
  exercisePicked: { exerciseId: string; context: 'logger' | 'template'; sessionId?: string; blockId?: string };
};

export const pickerEvents = new SimpleEventEmitter<PickerEvents>();