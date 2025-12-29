import type { Item } from "../types";

const BASE_URL = "http://localhost:5000";

// Fetch all items
export const getFinishedList = async (): Promise<Item[]> => {
  const res = await fetch(`${BASE_URL}/items`);
  if (!res.ok) {
    throw new Error("Failed to fetch finished list");
  }
  return res.json();
};

// Add a new item
export const addToFinishedList = async (
  item: Omit<Item, "id">
): Promise<Item> => {
  const res = await fetch(`${BASE_URL}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });

  if (!res.ok) {
    throw new Error("Failed to add item");
  }

  return res.json();
};

// Remove an item
export const removeFromFinishedList = async (id: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/items/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to remove item");
  }
};

// Persist full reordered list
export const reorderFinishedList = async (
  newList: Item[]
): Promise<Item[]> => {
  const res = await fetch(`${BASE_URL}/items/reorder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newList }),
  });

  if (!res.ok) {
    throw new Error("Failed to persist reordered list");
  }

  return res.json();
};
