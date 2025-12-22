import type { Item } from "../types";

const API_URL = "http://localhost:4000"; // backend URL

export async function getItems(type: "films" | "games" | "books"): Promise<Item[]> {
  const res = await fetch(`${API_URL}/${type}`);
  return res.json();
}

export async function addToFinishedList(item: Item) {
  const res = await fetch(`${API_URL}/finishedList`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  return res.json();
}

export async function removeFromFinishedList(id: string) {
  const res = await fetch(`${API_URL}/finishedList/${id}`, { method: "DELETE" });
  return res.json();
}

export async function getFinishedList(): Promise<Item[]> {
  const res = await fetch(`${API_URL}/finishedList`);
  return res.json();
}
