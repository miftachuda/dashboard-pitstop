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
import MultiImageUpload from "./MultiImageUpload";
import ImagePreviewRow from "./ImagePreview";
import EditableHighlight from "./EditableHighlight";
import SortDropdown, { SortOption } from "./SortDropdown";

export type ActionItem = {
  action: string;
  createdAt: string; // ISO timestamp
};
export type Status = "open" | "need support" | "in progress" | "done";
export type HighlightItem = {
  id: string;
  highlight: string;
  type_equipment: EquipmentType;
  status: Status;
  follow_up: string;
  created: number;
  updated?: number;
  tag_number?: string;
  unit?: string;
  pic?: string;
  date_closed?: number;
  photos?: string[]; // array of image URLs
};

const statusColor: Record<HighlightItem["status"], string> = {
  open: "bg-red-100 text-red-700",
  "need support": "bg-yellow-100 text-yellow-700",
  "in progress": "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

export default function Highlight() {
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [highlight, setHighlight] = useState("");
  const [pic, setPic] = useState("");
  const [tag_number, setTag_number] = useState("");
  const [unit, setUnit] = useState("");
  const [type_equipment, setType_equipment] = useState<EquipmentType>("Other");
  const [status, setStatus] = useState<HighlightItem["status"]>("open");
  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };
  const deleteHighlight = async (highlightId: string) => {
    try {
      // pb.collection("highlight_pitstop").delete(highlightId);
      await pb.collection("highlight_pitstop").update(highlightId, {
        is_deleted: true,
      });
      setHighlights((prev) => prev.filter((item) => item.id !== highlightId));
      toast.custom((t) => (
        <div className="flex items-center gap-3 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">
          <span>🗑️ Deleted successfully</span>
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
      tag_number: record.tag_number,
      unit: record.unit,
      pic: record.pic,
      date_closed: record.date_closed,
      photos: record.photos || [],
      // add fields as needed
    };
  }

  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const handlePhotosChange = (files: File[]) => {
    setPhotos(files);
  };
  const handleUpload = async (taskId: string) => {
    if (!photos || photos.length === 0) return;

    setUploading(true);

    const formData = new FormData();
    photos.forEach((file) => {
      formData.append("photos+", file);
    });

    try {
      await pb.collection("highlight_pitstop").update(taskId, formData);

      const updated = await pb.collection("highlight_pitstop").getOne(taskId);

      setHighlights((prev) =>
        prev.map((item) =>
          item.id === updated.id
            ? { ...item, photos: updated.photos || [] }
            : item,
        ),
      );

      // 🔥 CLEAR LOCAL PREVIEW
      setPhotos([]);

      // 🔁 force reset uploader (if needed)
      setUploadDoneKey((prev) => prev + 1);

      toast.success("Photos uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };
  async function loadHighlights() {
    try {
      const [highlightRecords] = await Promise.all([
        pb
          .collection("highlight_pitstop")
          .getFullList({ sort: "-created", filter: "is_deleted = false" }), // example
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
  const sortOptions: SortOption[] = [
    { label: "Status (op,ns,ip,dn)", value: "state" },
    { label: "Date (newest → oldest)", value: "date" },
    { label: "Name (A → Z)", value: "name_asc" },
    { label: "Name (Z → A)", value: "name_desc" },
  ];
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
      formData.append("tag_number", tag_number);
      formData.append("unit", unit);
      formData.append("pic", pic);

      // 🔥 multiple images
      photos.forEach((file: File) => {
        formData.append("photos", file); // Must match PocketBase field name
      });
      await pb.collection("highlight_pitstop").create(formData);

      await loadHighlights();

      setIsOpen(false);
      setHighlight("");
      setType_equipment(equipmentTypes[0]);
      setStatus("open");
      setTag_number("");
      setUnit("");
      setPic("");
      setPhotos([]);

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
  const [uploadDoneKey, setUploadDoneKey] = useState(0);
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
  const handleHighlightUpdate = (id: string, newValue: string) => {
    setHighlights((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, highlight: newValue, updated: Date.now() } : h,
      ),
    );
  };
  const statusOrder: Record<string, number> = {
    open: 1,
    "need support": 2,
    "in progress": 3,
    done: 4,
  };
  // const sorted_hl = highlights.sort((a, b) => {
  //   return statusOrder[a.status] - statusOrder[b.status];
  // });
  const [sort, setSort] = useState("state");

  const sorted_hl = [...highlights].sort((a, b) => {
    switch (sort) {
      case "state":
        return statusOrder[a.status] - statusOrder[b.status];
      case "name_asc":
        return a.tag_number.localeCompare(b.tag_number);
      case "name_desc":
        return b.tag_number.localeCompare(a.tag_number);
      case "date":
        return a.created - b.created;
      default:
        return 0;
    }
  });
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
                className="bg-red-500 text-primary-foreground hover:bg-red-600 px-3 py-1 rounded text-sm"
              >
                + Add Highlight
              </button>
              <SortDropdown
                options={sortOptions}
                value={sort}
                onChange={setSort}
              />

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
                        <label className="text-sm font-medium ">
                          Highlight
                        </label>
                        <input
                          type="text"
                          className="w-full mt-1 border text-xs rounded-lg px-3 py-2"
                          placeholder="Highlight"
                          value={highlight}
                          onChange={(e) => setHighlight(e.target.value)}
                        />
                      </div>
                      <MultiImageUpload
                        onChange={setPhotos}
                        uploadedTrigger={uploadDoneKey}
                      />
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
                        <label className="text-sm font-medium">
                          Tag Number
                        </label>
                        <input
                          type="text"
                          className="w-full mt-1 border text-xs rounded-lg px-3 py-2"
                          placeholder="Tag Number"
                          value={tag_number}
                          onChange={(e) => setTag_number(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">
                          PIC bagian terkait
                          <label className="text-[8px] font-medium ml-2">
                            eg. LOC II, MA II, SSIE, PE, etc.
                          </label>
                        </label>
                        <input
                          type="text"
                          className="w-full mt-1 border text-xs rounded-lg px-3 py-2"
                          placeholder="PIC bagian terkait "
                          value={pic}
                          onChange={(e) => setPic(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as Status)}
                          className="w-full mt-1 text-xs border rounded-lg px-3 py-2"
                        >
                          <option value="open">Open</option>
                          <option value="in progress">In Progress</option>
                          <option value="need support">Need Support</option>
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
                expanded ? "max-h-none" : "max-h-[200px]"
              }`}
            >
              {sorted_hl.map((item) => {
                const isOpen = openId === item.id;

                return (
                  <div
                    key={item.id}
                    className="border rounded-lg overflow-hidden transition-all"
                  >
                    {/* HEADER ROW */}
                    <div onClick={() => toggle(item.id)} className="w-full ">
                      <div className="flex flex-col items-end">
                        <div className="w-full flex flex-col items-end justify-between p-1 hover:bg-slate-200 transition-colors">
                          <div className="flex items-center w-full gap-2 text-left pl-3 m-1">
                            {/* LEFT SIDE */}
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              {/* TYPE */}

                              <span
                                className={`min-w-32 text-[13px] font-bold px-3 py-1 rounded whitespace-nowrap ${typeClasses[item.type_equipment]}`}
                              >
                                {item.type_equipment}
                              </span>

                              {/* TAG */}

                              {/* Editable (biar dia yang flexible) */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-row gap-2 mb-2">
                                  <span className="flex items-center px-2.5 py-1 text-xs rounded bg-lime-50 text-lime-700 whitespace-nowrap">
                                    {item.tag_number}
                                  </span>

                                  <EditableHighlight
                                    item={item}
                                    pb={pb}
                                    onUpdated={handleHighlightUpdate}
                                  />
                                  <div className="flex items-stretch gap-2 w-full pr-3">
                                    <div className="flex ml-auto flex-row">
                                      <span className="inline-flex items-center  px-2.5 py-1 text-xs rounded-2xl bg-cyan-50 text-cyan-700">
                                        PIC : {item.pic}
                                      </span>
                                      <span className="text-xs text-muted-foreground px-2.5 py-1 ">
                                        Created:{" "}
                                        {formatDistanceToNowStrict(
                                          new Date(item.created),
                                          {
                                            addSuffix: true,
                                          },
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <ActionList
                                  itemId={item.id}
                                  initialList={parseFollowUp(item.follow_up)}
                                  colID="highlight_pitstop"
                                />
                              </div>
                            </div>

                            {/* RIGHT SIDE */}
                            <div className="flex items-center gap-3 shrink-0 pl-4">
                              <StatusPopup
                                item={item}
                                handleStatusChange={handleStatusChange}
                                statusColor={statusColor}
                              />
                              <DeleteWithConfirm
                                onDelete={() => deleteHighlight(item.id)}
                              />

                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* COLLAPSIBLE CONTENT */}
                    <div
                      className={`transition-all duration-300 ${
                        isOpen ? " p-3" : "max-h-0 px-3"
                      } overflow-hidden`}
                    >
                      <div
                        className="flex
                      flex-col "
                      >
                        <ImagePreviewRow
                          images={item.photos}
                          recordId={item.id}
                          baseUrl={baseUrl}
                          collectionID="highlight_pitstop"
                        />
                        <MultiImageUpload
                          onChange={handlePhotosChange}
                          taskId={item.id}
                          uploadedTrigger={uploadDoneKey}
                        />
                        <button
                          onClick={() => handleUpload(item.id)}
                          disabled={uploading}
                          className={`mt-2 px-3 py-1 rounded text-white inline-flex w-fit items-center gap-2 ${
                            uploading
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600"
                          }`}
                        >
                          {uploading && (
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                              />
                            </svg>
                          )}

                          {uploading ? "Uploading..." : "Upload"}
                        </button>
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
