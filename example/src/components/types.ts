export interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export type Filter = "all" | "active" | "completed";
