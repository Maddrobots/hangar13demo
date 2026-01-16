import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { LogbookSummaryCards } from "@/components/apprentice/logbook-summary-cards";
import { LogbookTable } from "@/components/apprentice/logbook-table";
import { AddEntryModal } from "@/components/apprentice/add-entry-modal";

async function getLogbookEntries(userId: string) {
  const supabase = await createServerSupabaseClient();

  // Get apprentice record
  const { data: apprentice, error: apprenticeError } = await supabase
    .from("apprentices")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (apprenticeError || !apprentice) {
    return null;
  }

  // Get all logbook entries with category from curriculum_items if linked
  const { data: logbookEntries, error: logbookError } = await supabase
    .from("logbook_entries")
    .select("*")
    .eq("apprentice_id", apprentice.id)
    .order("entry_date", { ascending: false });

  return logbookEntries || [];
}

export default async function LogbookPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const entries = await getLogbookEntries(user.id);

  if (entries === null) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">OJT Logbook</h1>
          <p className="text-muted-foreground mt-2">
            No apprentice record found. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalHours = entries.reduce((sum, entry) => sum + (parseFloat(entry.hours_worked?.toString() || "0") || 0), 0);
  const pendingCount = entries.filter((e) => e.status === "submitted").length;
  const signedCount = entries.filter((e) => e.status === "approved").length;
  const totalEntries = entries.length;

  // Entries already have skills_practiced which we're using for ATA chapter

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight">OJT Logbook</h1>
          <p className="text-muted-foreground text-lg">
            Track your daily work and hours
          </p>
        </div>
        <AddEntryModal />
      </div>

      {/* Summary Cards */}
      <LogbookSummaryCards
        totalHours={totalHours}
        pendingCount={pendingCount}
        signedCount={signedCount}
        totalEntries={totalEntries}
      />

      {/* Table */}
      <LogbookTable entries={entries} runningTotal={totalHours} />
    </div>
  );
}
