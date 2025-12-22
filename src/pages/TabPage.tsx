import React, { useState } from "react";
import type { Item } from "../types";
import Card from "../components/Card";
import { useFinishedList } from "../context/FinishedListContext";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

interface TabPageProps {
  type: "films" | "games" | "books";
}

const TabPage: React.FC<TabPageProps> = ({ type }) => {
  const { finishedList, addItem, reorderItems } = useFinishedList();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Sensors for drag detection
  const sensors = useSensors(useSensor(PointerSensor));

  const handleAdd = () => {
    if (!title) return;
    const newItem: Item = {
      id: Date.now().toString(),
      title,
      description,
      type,
    };
    addItem(newItem);
    setTitle("");
    setDescription("");
  };

  const items = finishedList.filter((item) => item.type === type);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    reorderItems(oldIndex, newIndex, type);
  };

  return (
    <div>
      <h1>{type.toUpperCase()}</h1>

      {/* Input form */}
      <div className="add-form">
        <input
          type="text"
          placeholder={`Add new ${type} title`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={handleAdd}>Add</button>
      </div>

      {/* Drag-and-drop cards */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="cards-container">
            {items.map((item) => (
              <Card key={item.id} item={item} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default TabPage;
