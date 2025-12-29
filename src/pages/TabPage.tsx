import React, { useState, useRef } from "react";
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
} from "@dnd-kit/sortable";

interface TabPageProps {
  type: "movies" | "games" | "books";
}

const TabPage: React.FC<TabPageProps> = ({ type }) => {
  const { finishedList, addItem, reorderItems } = useFinishedList();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(useSensor(PointerSensor));

const handleAdd = async () => {
  if (!title) return;

  await addItem({
    title,
    description,
    type,
  });

  setTitle("");
  setDescription("");
  
  // Autofocus on title input after adding
  titleInputRef.current?.focus();

  // Scroll to bottom after a brief delay to ensure item is rendered
  setTimeout(() => {
    if (cardsContainerRef.current) {
      cardsContainerRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, 100);
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
      <h1><div className="title-name">{type.toUpperCase()}</div></h1>

      {/* Input form */}
      <div className="add-form">
        <input
          ref={titleInputRef}
          type="text"
          placeholder={`Add new ${type} title`}
          value={title}
          maxLength={90}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAdd();
            }
          }}
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          maxLength={90}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAdd();
            }
          }}
        />
        <button onClick={handleAdd}>Add</button>
      </div>

      {/* Drag-and-drop cards */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div ref={cardsContainerRef} className="cards-container">
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
