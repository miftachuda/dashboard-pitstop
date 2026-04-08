import { useEffect, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import {
  EquipmentType,
  equipmentTypes,
  StepGroup,
  StepTask,
  typeClasses,
  typeColors,
} from "@/types/maintenance";
import { baseUrl, pb } from "@/lib/pocketbase";
import DeleteWithConfirm from "./Deletion";
import { toast } from "sonner";
import { formatDistanceToNow, formatDistanceToNowStrict, set } from "date-fns";
import ActionList from "./ActionList";
import StatusPopup from "./StatusPopup";
import MultiImageUpload from "./InputImage";
import ImagePreviewRow from "./ImagePreview";

export type ActionItem = {
  action: string;
  createdAt: string; // ISO timestamp
};
export type Status = "open" | "need follow up" | "in-progress" | "done";
export type HighlightItem = {
  id: string;
  highlight: string;
  type_equipment: EquipmentType;
  status: Status;
  follow_up: string;
  created: number;
  updated?: number;
  date_closed?: number;
  photos?: string[]; // array of image URLs
};

const statusColor: Record<HighlightItem["status"], string> = {
  open: "bg-red-100 text-red-700",
  "need follow up": "bg-red-100 text-red-700",
  "in-progress": "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

export default function Highlight() {
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [highlight, setHighlight] = useState("");
  const [type_equipment, setType_equipment] = useState<EquipmentType>("Other");
  const [status, setStatus] = useState<HighlightItem["status"]>("open");
  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };
  const deleteHighlight = async (highlightId: string) => {
    try {
      await pb.collection("highlight_pitstop").delete(highlightId);
      setHighlights((prev) => prev.filter((item) => item.id !== highlightId));
      toast.custom((t) => (
        <div className="flex items-center gap-3 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">
          <span>🗑️ Saved successfully</span>
        </div>
      ));
    } catch (err) {
      console.error("Failed to delete highlight:", err);
      toast.error("Failed to delete highlight");
    }
  };
  function recordToHighlightItem(record: any): HighlightItem {
    return {
      id: record.id,
      highlight: record.highlight,
      type_equipment: record.type_equipment,
      follow_up: record.follow_up,
      status: record.status as HighlightItem["status"],
      created: record.created,
      updated: record.updated,
      date_closed: record.date_closed,
      photos: record.photo || [],
      // add fields as needed
    };
  }

  const [tasks, setTasks] = useState<StepTask[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadHighlights() {
    try {
      const [highlightRecords] = await Promise.all([
        pb.collection("highlight_pitstop").getFullList({ sort: "-created" }), // example
      ]);

      const fetchedHighlights: HighlightItem[] = highlightRecords.map(
        (record) => recordToHighlightItem(record), // create this mapper
      );
      setHighlights(fetchedHighlights); // <- new state
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadHighlights();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saving) return;
    setSaving(true);

    try {
      const formData = new FormData();

      // 🔹 text fields
      formData.append("highlight", highlight);
      formData.append("type_equipment", type_equipment);
      formData.append("status", status);

      // 🔥 multiple images
      images.forEach((file: File) => {
        formData.append("photo", file); // Must match PocketBase field name
      });
      await pb.collection("highlight_pitstop").create(formData);

      await loadHighlights();

      setIsOpen(false);
      setHighlight("");
      setType_equipment(equipmentTypes[0]);
      setStatus("open");
      setImages([]);

      toast.custom(() => (
        <div className="flex items-center gap-3 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">
          <span>✅ Saved successfully</span>
        </div>
      ));
    } catch (err) {
      console.error("Failed to save highlight:", err);
      toast.error("Failed to save highlight");
    } finally {
      setSaving(false);
    }
  };
  function parseFollowUp(value: string | null | undefined): ActionItem[] {
    try {
      if (!value) return [];

      const parsed = typeof value === "string" ? JSON.parse(value) : value;

      return (parsed?.actions ?? []).map(
        (item: any): ActionItem => ({
          action: item?.action ?? "",
          createdAt: item?.createdAt ?? Date.now(),
        }),
      );
    } catch (err) {
      console.error("JSON parse error:", err);
      return [];
    }
  }
  const handleStatusChange = async (id: string, newStatus: Status) => {
    try {
      // update local state
      setHighlights((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item,
        ),
      );
      // update backend (PocketBase example)
      await pb.collection("highlight_pitstop").update(id, {
        status: newStatus,
      });
      toast.success("Status updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };
  return (
    <>
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary"></div>
        </div>
      ) : (
        <div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-row items-center gap-3 ">
              <h2 className="text-lg font-semibold  border-emerald-300">
                Highlights
              </h2>
              <button
                onClick={() => setIsOpen(true)}
                className="bg-indigo-500 text-primary-foreground hover:bg-indigo-500/80 px-3 py-1 rounded text-sm"
              >
                + Add Highlight
              </button>
              {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  {/* BACKDROP */}
                  <div
                    className="absolute inset-0 bg-black/40"
                    onClick={() => setIsOpen(false)}
                  />

                  {/* MODAL */}
                  <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 z-10">
                    <h2 className="text-lg font-semibold mb-4">
                      Add Highlight
                    </h2>

                    {/* FORM */}
                    <form className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Highlight</label>
                        <input
                          type="text"
                          className="w-full mt-1 border text-xs rounded-lg px-3 py-2"
                          placeholder="Type Hghlight"
                          value={highlight}
                          onChange={(e) => setHighlight(e.target.value)}
                        />
                      </div>
                      <MultiImageUpload onChange={setImages} />
                      {/* Type Equipment */}
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">
                          Type Equipment
                        </label>
                        <select
                          value={type_equipment}
                          onChange={(e) =>
                            setType_equipment(e.target.value as EquipmentType)
                          }
                          className="px-3 text-xs py-2 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {equipmentTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as Status)}
                          className="w-full mt-1 text-xs border rounded-lg px-3 py-2"
                        >
                          <option value="open">Open</option>
                          <option value="done">Done</option>
                        </select>
                      </div>

                      {/* Follow Up (JSON style) */}
                      {/* <div>
                  <label className="text-sm font-medium">Follow Up</label>
                  <textarea
                    className="w-full mt-1 border rounded-lg px-3 py-2 font-mono text-sm"
                    rows={4}
                    defaultValue={`{
  "followup": [
    "inspection",
    "overlay shell",
    "post inspection"
  ]
}`}
                  />
                </div> */}

                      {/* ACTIONS */}
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsOpen(false)}
                          className="px-3 py-1 rounded border hover:bg-muted text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          onClick={handleSubmit}
                          disabled={saving}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
                        >
                          {saving && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          )}
                          {saving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            <div
              className={`bg-card border rounded-xl p-2 space-y-1 overflow-y-auto transition-all duration-300 ${
                expanded ? "max-h-none" : "max-h-[158px]"
              }`}
            >
              {highlights.map((item) => {
                const isOpen = openId === item.id;

                return (
                  <div
                    key={item.id}
                    className="border rounded-lg overflow-hidden transition-all"
                  >
                    {/* HEADER ROW */}
                    <div
                      onClick={() => toggle(item.id)}
                      className="w-full flex items-center justify-between p-1 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-1 text-left">
                        {/* TYPE */}
                        <span
                          className={`text-[10px] px-1 py-0 rounded ${typeClasses[item.type_equipment]}`}
                        >
                          {item.type_equipment}
                        </span>

                        {/* TITLE */}
                        <span className="font-medium text-xs">
                          {item.highlight}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Created:{" "}
                            {formatDistanceToNowStrict(new Date(item.created), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        {/* STATUS */}
                        <StatusPopup
                          item={item}
                          handleStatusChange={handleStatusChange}
                          statusColor={statusColor}
                        />
                        <DeleteWithConfirm
                          onDelete={() => deleteHighlight(item.id)}
                        />
                        {/* CHEVRON */}
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* COLLAPSIBLE CONTENT */}
                    <div
                      className={`transition-all duration-300 ${
                        isOpen ? "max-h-40 p-3" : "max-h-0 px-3"
                      } overflow-hidden`}
                    >
                      <div
                        className="flex
                      flex-col"
                      >
                        <ImagePreviewRow
                          images={item.photos}
                          recordId={item.id}
                          baseUrl={baseUrl}
                        />
                        <ActionList
                          itemId={item.id}
                          initialList={parseFollowUp(item.follow_up)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="mt-2 text-xs text-slate-400 hover:text-slate-500 "
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
