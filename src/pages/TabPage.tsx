import React, { useState } from "react";
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
