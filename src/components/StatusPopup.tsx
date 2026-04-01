import { useState } from "react";
import { createPortal } from "react-dom";

export default function StatusModal({
  item,
  handleStatusChange,
  statusColor,
}: {
  item: any;
  handleStatusChange: (id: string, status: "open" | "done") => void;
  statusColor: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger */}
      <span
        onClick={() => setOpen(true)}
        className={`text-xs px-2 py-1 rounded cursor-pointer ${statusColor[item.status]}`}
      >
        {item.status}
      </span>

      {/* Overlay Modal */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* backdrop */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
            />

            {/* modal content */}
            <div className="relative bg-white rounded-lg shadow-lg p-4 w-40 space-y-2 z-10">
              <p className="text-xs text-gray-500">
                Are you sure to change the status?
              </p>

              {["open", "done"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    handleStatusChange(item.id, status as "open" | "done");
                    setOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1 rounded text-sm hover:bg-gray-100 ${
                    item.status === status ? `${statusColor[status]}` : ""
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
