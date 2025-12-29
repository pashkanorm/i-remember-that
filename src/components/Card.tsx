import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useFinishedList } from "../context/FinishedListContext";
import type { Item } from "../types";

interface CardProps {
  item: Item;
}

const Card: React.FC<CardProps> = ({ item }) => {
  const { removeItem } = useFinishedList();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleRemove = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent triggering drag
    await removeItem(item.id);
  };

  return (
    <div ref={setNodeRef} style={style} className="card" {...attributes}>
      <div className="card-content" {...listeners}>
        <div className="text">
          <h2>{item.title}</h2>
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
