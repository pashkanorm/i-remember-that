export interface Item {
  id: string;
  title: string;
  description?: string;
  type?: "films" | "games" | "books";
}
