import { useState } from "react";
import { Pencil, Check, Loader2 } from "lucide-react";

type Props = {
  item: any;
  pb: any;
  onUpdated?: (id: string, value: string) => void;
};

export default function EditableHighlight({ item, pb, onUpdated }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(item.highlight);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (value === item.highlight) {
      setIsEditing(false);
      return;
    }

    setSaving(true);

    try {
      await pb.collection("highlight_pitstop").update(item.id, {
        highlight: value,
      });

      onUpdated?.(item.id, value);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="text-xs border px-2 py-1 rounded w-full"
        />
      ) : (
        <span className="font-medium text-xs flex-1 min-w-0 break-words">
          {item.highlight}
        </span>
      )}

      <button
        onClick={isEditing ? handleSave : () => setIsEditing(true)}
        disabled={saving}
        className={`p-1 rounded text-white flex items-center justify-center ${
          saving
            ? "bg-gray-400 cursor-not-allowed"
            : isEditing
              ? "bg-green-500 hover:bg-green-600"
              : "text-gray-500 hover:bg-gray-200"
        }`}
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isEditing ? (
          <Check className="w-4 h-4" />
        ) : (
          <Pencil className="w-4 h-4 text-gray-600" />
        )}
      </button>
    </div>
  );
}
