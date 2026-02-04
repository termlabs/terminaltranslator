export type Message = {
  content: string;
  role: 'user' | 'assistant';
};

const history: Message[] = [];

export function add(content: string, role: 'user' | 'assistant'): void {
  history.push({ content, role });
}

export function get(index: number): Message | undefined {
  return history[index];
}

export function getHistoryLength(): number {
  return history.length;
}
