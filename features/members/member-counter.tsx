"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users } from "lucide-react";

export function MemberCounter() {
  const [count, setCount] = useState<number | null>(null);

  const fetchCount = async () => {
    const supabase = createClient();
    const { count: total, error } = await supabase
      .from("members")
      .select("*", { count: 'exact', head: true });

    if (!error) {
      setCount(total);
    }
  };

  useEffect(() => {
    fetchCount();

    // Escuchar si se agregan o borran socios para actualizar el número al instante
    const supabase = createClient();
    const channel = supabase
      .channel("member-count-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "members" }, () => {
        fetchCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
      <Users className="h-5 w-5 text-primary" />
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70 leading-none">Total Socios</span>
        <span className="text-xl font-black text-primary leading-none">
          {count !== null ? count : "..."}
        </span>
      </div>
    </div>
  );
}
