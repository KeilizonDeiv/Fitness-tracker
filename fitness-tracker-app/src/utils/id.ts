// Lightweight unique id generator (no native crypto dependency needed).
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
