export interface Item {
  id: string;
  title: string;
  description?: string;
  type: "movies" | "games" | "books";
}
