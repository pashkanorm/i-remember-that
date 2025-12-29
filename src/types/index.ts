export interface Item {
  id: string;
  title: string;
  description?: string;
  type: "movies" | "games" | "books";
  // Optional DB fields
  order?: number;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}
