import { useState } from "react";
import { Pencil, Plus, Check } from "lucide-react";
import { pb } from "@/lib/pocketbase";
import { toast } from "sonner";
export default function ActionList({
  itemId,
  initialList,
}: {
  itemId: string;
  initialList: string[];
}) {
  const [list, setList] = useState<string[]>(initialList || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [actions, setActions] = useState<string[]>([]); // list
  const [newAction, setNewAction] = useState<string>("");
  const handleSave = async (newList: string[]) => {
    setList(newList);

    try {
      await pb.collection("maintenance_steps").update(itemId, {
        follow_up: JSON.stringify(newList),
      });
      toast.success("Follow-up actions updated");
    } catch (err) {
      toast.error("Failed to update follow-up actions");
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setTempValue(list[index]);
  };

  const handleUpdate = async () => {
    if (editingIndex === null) return;

    const newList = [...list];
    newList[editingIndex] = tempValue;

    setEditingIndex(null);
    await handleSave(newList);
  };

  const handleAdd = () => {
    if (!newAction.trim()) return;

    setActions((prev) => [...prev, newAction.trim()]); // ✅ correct
    setNewAction(""); // reset input
  };

  return (
    <div className="space-y-2">
      {list.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-2 bg-muted rounded px-2 py-1"
        >
          {editingIndex === index ? (
            <input
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="border px-2 py-0 text-[12px] w-full"
            />
          ) : (
            <span className="text-[12px]">{item}</span>
          )}

          <div className="flex gap-1">
            {editingIndex === index ? (
              <button onClick={handleUpdate}>
                <Check size={16} />
              </button>
            ) : (
              <button onClick={() => handleEdit(index)}>
                <Pencil size={12} />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* ADD BUTTON */}
      <div className="flex items-center gap-2 mt-2">
        <input
          type="text"
          value={newAction}
          onChange={(e) => setNewAction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Add action..."
          className="text-xs px-2 py-1 border rounded w-full"
        />

        <button
          onClick={handleAdd}
          disabled={!newAction.trim()}
          className="text-blue-500 disabled:opacity-30"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
