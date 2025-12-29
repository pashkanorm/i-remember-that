import React, { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useFinishedList } from "../context/FinishedListContext";
import type { Item } from "../types";

interface CardProps {
  item: Item;
}

const Card: React.FC<CardProps> = ({ item }) => {
  const { removeItem, updateItem } = useFinishedList();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleRemove = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent triggering drag
    await removeItem(item.id);
  };

  // inline edit state
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(item.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setValue(item.title);
    setIsEditing(true);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    console.log("[Card] handleLinkClick called");
    e.preventDefault();
    e.stopPropagation();

    // Add suffix based on item type
    const suffix = {
      movies: "movie",
      games: "game",
      books: "book",
    }[item.type];

    const searchQuery = `${item.title} ${suffix}`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(
      searchQuery
    )}`;
    console.log("[Card] Opening Google search:", url);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    startEditing(e);
  };

  // Autofocus and position cursor at end when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      // Use longer timeout to ensure DOM is fully settled
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const len = inputRef.current.value.length;
          inputRef.current.setSelectionRange(len, len);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  const saveEdit = async () => {
    if (!isEditing) return;
    if (value.trim() === "") {
      setValue(item.title);
      setIsEditing(false);
      return;
    }
    await updateItem(item.id, { title: value });
    setIsEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="card" {...attributes}>
      <div
        className="card-content"
        {...listeners}
        onDoubleClick={handleDoubleClick}
      >
        <div className="text">
          <h2>
            {isEditing ? (
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <input
                  ref={inputRef}
                  autoFocus
                  className="edit-input"
                  value={value}
                  maxLength={90}
                  onChange={(e) => setValue(e.target.value)}
                  onBlur={() => saveEdit()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      saveEdit();
                    } else if (e.key === "Escape") {
                      setIsEditing(false);
                      setValue(item.title);
                    }
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                />
                <button
                  className="save-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    saveEdit();
                  }}
                >
                  ✓
                </button>
              </span>
            ) : (
              <span
                className="card-title"
                onClick={(e) => {
                  console.log("[Card] span clicked");
                  e.stopPropagation();
                  handleLinkClick(e);
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                onPointerUp={(e) => {
                  e.stopPropagation();
                }}
                style={{ cursor: "pointer", pointerEvents: "auto" }}
              >
                {item.title}
              </span>
            )}
          </h2>
          {item.description && <p>{item.description}</p>}
        </div>
        {/* Make button ignore drag events */}
        <button
          className="remove-btn"
          onPointerDown={(e) => e.stopPropagation()} // ensures drag doesn't start on click
          onClick={handleRemove}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Card;
