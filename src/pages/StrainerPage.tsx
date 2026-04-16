import DashboardLayout from "@/components/MainLayout";
import RestrokeInput from "@/components/RestrokeInput";
import { pb } from "@/lib/pocketbase";
import { EquipmentType, equipmentTypes } from "@/types/maintenance";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const StrainerPage = () => {
  type Status = "open" | "need support" | "in progress" | "done";
  type StrainerItem = {
    id: string;
    progress: number;
    shift: string;
    tanggal: string;
    status: Status;
    tag_number: string;
    pic: string;
    keterangan: string;
    created: number;
    updated?: number;
  };

  const [cleaning_strainer, setDaily_activity] = useState<StrainerItem[]>([]);
  const [saving, setSaving] = useState(false);

  const [activity, setHighlight] = useState("");
  const [type_equipment, setType_equipment] = useState<EquipmentType>("Other");

  const deleteStrainer = async (activityId: string) => {
    try {
      await pb.collection("cleaning_strainer").delete(activityId);
      setDaily_activity((prev) =>
        prev.filter((item) => item.id !== activityId),
      );
      toast.custom((t) => (
        <div className="flex items-center gap-3 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">
          <span>🗑️ Saved successfully</span>
        </div>
      ));
    } catch (err) {
      console.error("Failed to delete activity:", err);
      toast.error("Failed to delete activity");
    }
  };
  function recordToStrainerItem(record: any): StrainerItem {
    return {
      id: record.id,
      tag_number: record.tag_number,
      shift: record.shift,
      tanggal: record.tanggal,
      pic: record.pic,
      status: record.status as Status,
      progress: record.progress ?? 0,
      keterangan: record.keterangan ?? "",
      created: record.created,
      updated: record.updated,
    };
  }
  const [loading, setLoading] = useState(true);
  const prefixes = ["002", "021", "022", "023", "024", "025", "041"];
  const [prefixFilter, setPrefixFilter] = useState<string | null>(null);

  async function loadStrainer() {
    try {
      const [activityRecords] = await Promise.all([
        pb.collection("cleaning_strainer").getFullList({ sort: "-created" }), // example
      ]);

      const fetchedHighlights: StrainerItem[] = activityRecords.map(
        (record) => recordToStrainerItem(record), // create this mapper
      );
      setDaily_activity(fetchedHighlights); // <- new state
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadStrainer();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        activity,
        type_equipment,
      };
      if (saving) return;
      setSaving(true);
      await pb.collection("cleaning_strainer").create(data);

      await loadStrainer();
      setHighlight("");
      setType_equipment(equipmentTypes[0]);

      toast.custom((t) => (
        <div className="flex items-center gap-3 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">
          <span>✅ Saved successfully</span>
        </div>
      ));
    } catch (err) {
      console.error("Failed to save activity:", err);
      toast.error("Failed to save activity");
    } finally {
      setSaving(false);
    }
  };
  const updateField = async (
    index: number,
    field: keyof StrainerItem,
    value: any,
  ) => {
    const updated = cleaning_strainer.map((r, i) =>
      i === index ? { ...r, [field]: value } : r,
    );

    setDaily_activity(updated);

    try {
      const row = updated[index];

      await pb.collection("cleaning_strainer").update(row.id, {
        [field]: value,
      });
    } catch (err) {
      console.error("PB update failed:", err);
    }
  };

  const handleProgressBlur = async (id: string, newProgress: number) => {
    try {
      // update local state
      setDaily_activity((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, progress: newProgress } : item,
        ),
      );
      // update backend (PocketBase example)
      await pb.collection("cleaning_strainer").update(id, {
        progress: newProgress,
      });
      toast.success("Progress updated");
    } catch (err) {
      toast.error("Failed to update progress");
    }
  };
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleProgressChange = (id: string, newProgress: number) => {
    // update UI immediately
    setDaily_activity((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, progress: newProgress } : item,
      ),
    );
    // clear previous timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // set new debounce
    debounceRef.current = setTimeout(() => {
      handleProgressBlur(id, newProgress); // your API call
    }, 500); // adjust delay (300–800ms is common)
  };
  const filteredStrainer = cleaning_strainer.filter((task) => {
    const matchPrefix =
      !prefixFilter ||
      task.tag_number?.substring(0, 3).toUpperCase() ===
        prefixFilter.toUpperCase();

    return matchPrefix;
  });
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        <main className="max-w-8xl  px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-nowrap items-center gap-1 mt-1 mb-1 overflow-x-auto">
            <button
              onClick={() => setPrefixFilter(null)}
              className={`px-3 py-1 rounded-md border text-sm whitespace-nowrap flex-shrink-0 ${
                prefixFilter === null ? "bg-primary text-white" : "bg-white"
              }`}
            >
              All
            </button>

            {prefixes.map((p) => (
              <button
                key={p}
                onClick={() => setPrefixFilter(p)}
                className={`px-3 py-1 rounded-md border text-sm whitespace-nowrap flex-shrink-0 ${
                  prefixFilter === p ? "bg-primary text-white" : "bg-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <table className="min-w-full border text-sm">
            <thead className="text-center">
              <tr>
                <th
                  className="sticky top-0 z-20 bg-gray-200 py-3 px-2"
                  rowSpan={2}
                >
                  NO
                </th>
                <th
                  className="sticky top-0 z-20 bg-gray-200 py-3 px-2"
                  rowSpan={2}
                >
                  TAG NUMBER
                </th>
                <th
                  className="sticky top-0 z-20 bg-gray-200 py-3 px-2"
                  rowSpan={2}
                >
                  PROGRESS
                </th>
                <th className="sticky top-0 z-20 bg-gray-200 py-2 px-2">
                  SHIFT
                </th>
                <th className="sticky top-0 z-20 bg-gray-200 py-2 px-2">PIC</th>
                <th className="sticky top-0 z-20 bg-gray-200 py-2 px-2">
                  KETERANGAN
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredStrainer.map((row, i) => (
                <tr key={i} className="text-center border whitespace-nowrap">
                  <td>{i + 1}</td>
                  <td>{row.tag_number}</td>
                  <td className="px-2 py-1">
                    <div className="relative w-32">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={row.progress}
                        onChange={(e) =>
                          handleProgressChange(row.id, Number(e.target.value))
                        }
                        className="w-full appearance-none h-5 rounded-lg outline-none"
                        style={{
                          background: `linear-gradient(to right, ${
                            row.progress === 100 ? "#22c55e" : "#6366f1"
                          } ${row.progress}%, #e5e7eb ${row.progress}%)`,
                        }}
                      />

                      {/* Hide thumb */}
                      <style>
                        {`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 0;
          height: 0;
        }
      `}
                      </style>

                      {/* Text */}
                      <div className="absolute inset-0 flex items-center mb-2 justify-center text-xs font-medium pointer-events-none">
                        {row.progress}%
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      value={row.shift ?? ""}
                      onChange={(e) => updateField(i, "shift", e.target.value)}
                      className="w-full px-1 border rounded bg-white"
                    >
                      <option value="">-</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </td>
                  {/* PIC */}
                  <td>
                    <RestrokeInput
                      value={row.pic}
                      onSave={(val) => updateField(i, "pic", val)}
                    />
                  </td>
                  {/* KETERANGAN */}
                  <td>
                    <RestrokeInput
                      value={row.keterangan}
                      onSave={(val) => updateField(i, "keterangan", val)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default StrainerPage;
