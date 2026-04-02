import { useEffect, useState } from "react";

export default function Header() {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [now, setNow] = useState<Date>(new Date());

  // function to refresh data
  const refreshData = async () => {
    try {
      console.log("refreshing data...");

      window.location.reload(); // reload page
      setLastRefresh(new Date());
    } catch (err) {
      console.error(err);
    }
  };
  // auto refresh every 3 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        refreshData();
      },
      5 * 60 * 1000,
    ); // 3 minutes

    return () => clearInterval(interval);
  }, []);

  // update "time ago" every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  const getTimeAgo = () => {
    const diff = Math.floor((now.getTime() - lastRefresh.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };
  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
        <div>
          <h1 className="text-lg font-display font-bold text-foreground leading-tight">
            Dashboard Pit Stop LOC II 2026
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Restoring Performance Strengthening Reliability
          </p>
        </div>
        <p className="text-[10px] text-muted-foreground font-mono mt-1 ml-auto">
          Last refresh: {getTimeAgo()}
        </p>
      </div>
    </header>
  );
}
