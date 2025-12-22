import { createContext, useState, useContext, useEffect, type ReactNode } from "react";
import type { Item } from "../types";
import { arrayMove } from "@dnd-kit/sortable";


interface FinishedListContextType {
  finishedList: Item[];
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  reorderItems: (oldIndex: number, newIndex: number, type: Item["type"]) => void;
}


const FinishedListContext = createContext<FinishedListContextType | undefined>(undefined);

const STORAGE_KEY = "finishedList";

export const FinishedListProvider = ({ children }: { children: ReactNode }) => {
  const [finishedList, setFinishedList] = useState<Item[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored) as Item[];
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finishedList));
  }, [finishedList]);

  const addItem = (item: Item) => {
    setFinishedList(prev => [...prev, item]);
  };

const removeItem = (id: string) => {
    console.log("removeItem called for id:", id);

  setFinishedList((prev) => {
    const newList = prev.filter((item) => item.id !== id);
    localStorage.setItem("finishedList", JSON.stringify(newList));
    return newList;
  });
};


const reorderItems = (oldIndex: number, newIndex: number, type: Item["type"]) => {
  const tabItems = finishedList.filter((i) => i.type === type);
  const reorderedTab = arrayMove(tabItems, oldIndex, newIndex);

  // Merge back with other items
  const otherItems = finishedList.filter((i) => i.type !== type);
  setFinishedList([...otherItems, ...reorderedTab]);
};


  return (
    <FinishedListContext.Provider value={{ finishedList, addItem, removeItem, reorderItems }}>
      {children}
    </FinishedListContext.Provider>
  );
};

export const useFinishedList = () => {
  const context = useContext(FinishedListContext);
  if (!context) throw new Error("useFinishedList must be used within FinishedListProvider");
  return context;
};
