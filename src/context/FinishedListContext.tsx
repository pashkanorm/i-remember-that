import { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import type { Item } from "../types";
import { arrayMove } from "@dnd-kit/sortable";
import { supabase } from "../supabaseClient";
import { useAuth } from "./AuthContext";

interface FinishedListContextType {
  finishedList: Item[];
  addItem: (item: Omit<Item, "id">) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  reorderItems: (oldIndex: number, newIndex: number, type: Item["type"]) => void;
}

const FinishedListContext = createContext<FinishedListContextType | undefined>(undefined);

export const FinishedListProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth(); // pull user from AuthContext
  const [finishedList, setFinishedList] = useState<Item[]>([]);

  // Load items depending on auth state
  useEffect(() => {
    const load = async () => {
      if (user) {
        const { data } = await supabase
          .from("items")
          .select("*")
          .eq("user_id", user.id)
          .order("order", { ascending: true })
          .order("created_at", { ascending: true });

        setFinishedList(data ?? []);
      } else {
        setFinishedList(JSON.parse(localStorage.getItem("finishedList") || "[]"));
      }
    };
    load();
  }, [user]);

  // Merge local storage items when user logs in
  useEffect(() => {
    if (!user) return;

    const merge = async () => {
      const localItems: Item[] = JSON.parse(localStorage.getItem("finishedList") || "[]");

      if (localItems.length === 0) {
        // No local items to merge, just load from database
        const { data } = await supabase
          .from("items")
          .select("*")
          .eq("user_id", user.id)
          .order("order", { ascending: true })
          .order("created_at", { ascending: true });

        setFinishedList((data as unknown as Item[]) ?? []);
        return;
      }

      try {
        // Use upsert to avoid conflicts - if item exists, update it; otherwise insert it
        const { data } = await supabase.from("items").upsert(
          localItems.map((item: Item, index: number) => ({ ...item, user_id: user.id, order: index })),
          { onConflict: "id" }
        );

        console.log("[FinishedListContext] Merged local items:", ((data as unknown as Item[]) ?? []).length);
        setFinishedList((data as unknown as Item[]) ?? []);
      } catch (err) {
        console.error("[FinishedListContext] Merge error:", err);
        // Fallback: load from database if merge fails
        const { data } = await supabase
          .from("items")
          .select("*")
          .eq("user_id", user.id)
          .order("order", { ascending: true })
          .order("created_at", { ascending: true });

        setFinishedList((data as unknown as Item[]) ?? []);
      }

      // Clear local storage after successful merge
      localStorage.removeItem("finishedList");
    };

    merge();
  }, [user]);

  const addItem = async (item: Omit<Item, "id">) => {
    if (user) {
      const { data } = await supabase
        .from("items")
        .insert([{ ...item, user_id: user.id }])
        .select()
        .single();

      setFinishedList((prev) => [...prev, data]);
    } else {
      const newItem = { ...item, id: crypto.randomUUID() };
      const updated = [...finishedList, newItem];
      setFinishedList(updated);
      localStorage.setItem("finishedList", JSON.stringify(updated));
    }
  };

  const removeItem = async (id: string) => {
    if (user) await supabase.from("items").delete().eq("id", id);

    const updated = finishedList.filter((i) => i.id !== id);
    setFinishedList(updated);

    if (!user) localStorage.setItem("finishedList", JSON.stringify(updated));
  };

  const reorderItems = (oldIndex: number, newIndex: number, type: Item["type"]) => {
    const sameTypeIndexes = finishedList
      .map((item, i) => ({ item, i }))
      .filter(({ item }) => item.type === type)
      .map(({ i }) => i);

    const from = sameTypeIndexes[oldIndex];
    const to = sameTypeIndexes[newIndex];

    if (from === undefined || to === undefined) return;

    const newList = arrayMove(finishedList, from, to);
    setFinishedList(newList);

    if (!user) {
      localStorage.setItem("finishedList", JSON.stringify(newList));
    } else {
      // Persist order to database
      const updates = newList.map((item, index) => ({
        id: item.id,
        order: index,
      }));

      updates.forEach(async ({ id, order }: { id: string; order: number }) => {
        try {
          await supabase
            .from("items")
            .update({ order, updated_at: new Date().toISOString() })
            .eq("id", id);
        } catch (err: unknown) {
          console.error("[FinishedListContext] Error updating item order:", err);
        }
      });
    }
  };

  return (
    <FinishedListContext.Provider value={{ finishedList, addItem, removeItem, reorderItems }}>
      {children}
    </FinishedListContext.Provider>
  );
};

export const useFinishedList = () => {
  const ctx = useContext(FinishedListContext);
  if (!ctx) throw new Error("useFinishedList must be used inside FinishedListProvider");
  return ctx;
};
