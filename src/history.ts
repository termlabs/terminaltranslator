export type Message = {
  content: string;
  role: 'user' | 'assistant';
};

const history: Message[] = [];

export const add = (content: string, role: 'user' | 'assistant'): void => {
  history.push({ content, role });
};

export const get = (index: number): Message | undefined => {
  return history[index];
};

export const getHistoryLength = (): number => {
  return history.length;
};
