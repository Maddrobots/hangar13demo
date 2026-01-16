import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AssignedApprenticesList } from "@/components/mentor/assigned-apprentices-list";
import { PendingLogbookEntries } from "@/components/mentor/pending-logbook-entries";

async function getMentorData(userId: string) {
  const supabase = await createServerSupabaseClient();

  // Get assigned apprentices
  const { data: apprentices, error: apprenticesError } = await supabase
    .from("apprentices")
    .select("*")
    .eq("mentor_id", userId)
    .eq("status", "active");

  // Get profiles for apprentices
  const apprenticesWithProfiles = await Promise.all(
    (apprentices || []).map(async (apprentice) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url")
        .eq("id", apprentice.user_id)
        .single();

      return {
        ...apprentice,
        profiles: profile,
      };
    })
  );

  // Get pending logbook entries from assigned apprentices
  const apprenticeIds = apprentices?.map((a) => a.id) || [];

  let pendingEntries: any[] = [];
  if (apprenticeIds.length > 0) {
    const { data: entries, error: entriesError } = await supabase
      .from("logbook_entries")
      .select("*")
      .in("apprentice_id", apprenticeIds)
      .eq("status", "submitted")
      .order("entry_date", { ascending: false });

    // Get apprentice and profile info for each entry
    pendingEntries = await Promise.all(
      (entries || []).map(async (entry) => {
        const { data: apprentice } = await supabase
          .from("apprentices")
          .select("id, user_id")
          .eq("id", entry.apprentice_id)
          .single();

        let profile = null;
        if (apprentice?.user_id) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .eq("id", apprentice.user_id)
            .single();
          profile = profileData;
        }

        return {
          ...entry,
          apprentices: apprentice
            ? {
                ...apprentice,
                profiles: profile,
              }
            : null,
        };
      })
    );
  }

  return {
    apprentices: apprenticesWithProfiles,
    pendingEntries,
  };
}

export default async function MentorDashboard() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const data = await getMentorData(user.id);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Mentor Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Manage your apprentices and review their logbook entries.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AssignedApprenticesList apprentices={data.apprentices} />
        <PendingLogbookEntries entries={data.pendingEntries} />
      </div>
    </div>
  );
}
