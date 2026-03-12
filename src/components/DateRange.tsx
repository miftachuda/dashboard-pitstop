import { useRef, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { enGB } from "date-fns/locale/en-GB";

registerLocale("en-GB", enGB);
export default function DateRange({
  item,
  taskId,
  stepId,
  handleTimeChange,
  formatDate,
  formatTime,
  getDuration,
}) {
  const inputRefStart = useRef({});
  const inputRefEnds = useRef({});
  function formatDateTimeLocal(timestamp: number) {
    const d = new Date(timestamp);

    const pad = (n: number) => String(n).padStart(2, "0");

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours(),
    )}:${pad(d.getMinutes())}`;
  }
  type LocaleWithTimeProps = {
    onChange?: (date: Date | null) => void;
  };

  const LocaleWithTime = ({ onChange }: LocaleWithTimeProps) => {
    const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(
      new Date(),
    );

    const handleChange = (date: Date | null) => {
      setSelectedDateTime(date);
      onChange?.(date); // pass value to parent
    };

    return (
      <DatePicker
        selected={selectedDateTime}
        onChange={handleChange}
        locale="en-GB"
        showTimeSelect
        timeFormat="p"
        timeIntervals={15}
        dateFormat="Pp"
        withPortal
      />
    );
  };
  return (
    <div className="flex items-center gap-2">
      {/* START DATE */}
      <div
        className="relative inline-flex items-center gap-1 border rounded-md px-1 py-1 bg-muted/30 hover:bg-muted transition cursor-pointer"
        onClick={() => inputRefStart.current[item.id]?.showPicker()}
      >
        <span className="absolute -top-3.5 left-2 px-1 text-[10px] text-muted-foreground text-green-300 bg-muted/0">
          Start
        </span>
        <div className="flex flex-row gap-1 text-center items-center">
          <span className="text-xs text-muted-foreground">
            {formatDate(item.startdate)}
          </span>
          <span className="text-xs font-medium font-mono">
            {formatTime(item.startdate)}
          </span>
        </div>

        <span className="text-muted-foreground text-[10px]">▾</span>
        {/* <LocaleWithTime
          onChange={(date: Date | null) =>
            handleTimeChange(
              taskId,
              stepId,
              item.id,
              "startdate",
              date ? date.getTime() : null,
            )
          }
        /> */}
        <input
          ref={(el) => (inputRefStart.current[item.id] = el)}
          type="datetime-local"
          lang="en-GB"
          value={item.startdate ? formatDateTimeLocal(item.startdate) : ""}
          onChange={(e) =>
            handleTimeChange(
              taskId,
              stepId,
              item.id,
              "startdate",
              new Date(e.target.value).getTime(),
            )
          }
          className="absolute inset-0 opacity-0"
        />
      </div>

      {/* END DATE */}
      <div
        className="relative inline-flex items-center gap-1 border rounded-md px-1 py-1 bg-muted/30 hover:bg-muted transition cursor-pointer"
        onClick={() => inputRefEnds.current[item.id]?.showPicker()}
      >
        <span className="absolute -top-3.5 left-2 px-1 text-[10px] text-muted-foreground text-cyan-300 bg-muted/0">
          End
        </span>
        <div className="flex flex-row gap-1 text-center items-center">
          <span className="text-xs text-muted-foreground">
            {formatDate(item.enddate)}
          </span>
          <span className="text-xs font-medium font-mono">
            {formatTime(item.enddate)}
          </span>
        </div>

        <span className="text-muted-foreground text-[10px]">▾</span>

        <input
          ref={(el) => (inputRefEnds.current[item.id] = el)}
          type="datetime-local"
          value={item.enddate ? formatDateTimeLocal(item.enddate) : ""}
          onChange={(e) =>
            handleTimeChange(
              taskId,
              stepId,
              item.id,
              "enddate",
              new Date(e.target.value).getTime(),
            )
          }
          className="absolute inset-0 opacity-0"
        />
      </div>

      {/* DURATION */}
      <span className="text-xs font-mono text-muted-foreground">
        {getDuration(item.startdate, item.enddate)}
      </span>
    </div>
  );
}
