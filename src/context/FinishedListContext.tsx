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
  const { user } = useAuth(); // <-- NEW: pull user from AuthContext
  const [finishedList, setFinishedList] = useState<Item[]>([]);

  // Load items depending on auth state
  useEffect(() => {
    const load = async () => {
      if (user) {
        const { data } = await supabase
          .from("items")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at");

        setFinishedList(data || []);
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
      const localItems = JSON.parse(localStorage.getItem("finishedList") || "[]");

      for (const item of localItems) {
        await supabase.from("items").insert({ ...item, user_id: user.id });
      }

      localStorage.removeItem("finishedList");

      const { data } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at");

      setFinishedList(data || []);
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

    if (!user) localStorage.setItem("finishedList", JSON.stringify(newList));
    else newList.forEach((item) =>
      supabase.from("items").update({ updated_at: new Date() }).eq("id", item.id)
    );
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
