import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { ProgressTrackingDashboard } from "@/components/apprentice/progress-tracking-dashboard";

async function getProgressData(userId: string) {
  const supabase = await createServerSupabaseClient();

  // Get apprentice record
  const { data: apprentice, error: apprenticeError } = await supabase
    .from("apprentices")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (apprenticeError || !apprentice) {
    return null;
  }

  // Get all logbook entries
  const { data: logbookEntries } = await supabase
    .from("logbook_entries")
    .select("*")
    .eq("apprentice_id", apprentice.id);

  // Calculate total hours
  const totalHours = logbookEntries?.reduce(
    (sum, entry) => sum + Number(entry.hours_worked || 0),
    0
  ) || 0;

  // Calculate current week
  const startDate = new Date(apprentice.start_date);
  const now = new Date();
  const daysSinceStart = Math.floor(
    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const currentWeek = Math.max(1, Math.floor(daysSinceStart / 7) + 1);
  const totalWeeks = 130;

  // Calculate expected hours (40 hours per week)
  const expectedHours = currentWeek * 40;
  const hoursDifference = totalHours - expectedHours;

  // Calculate approved submissions count
  const approvedCount = logbookEntries?.filter(
    (entry) => entry.status === "approved"
  ).length || 0;

  // Calculate ATA chapter hours and status
  const ataChapterData: Record<string, { hours: number; status: string }> = {};
  logbookEntries?.forEach((entry) => {
    if (entry.skills_practiced && entry.skills_practiced.length > 0) {
      const ataMatch = entry.skills_practiced[0]?.match(/ATA:\s*(\d+)\s*-/);
      if (ataMatch) {
        const chapter = ataMatch[1];
        const currentData = ataChapterData[chapter] || { hours: 0, status: "none" };
        currentData.hours = currentData.hours + Number(entry.hours_worked || 0);
        
        // Determine status: if any entry is submitted or draft, show the most relevant status
        // Priority: submitted > draft > approved (approved doesn't need action)
        if (entry.status === "submitted" || currentData.status === "submitted") {
          currentData.status = "submitted";
        } else if (entry.status === "draft" && currentData.status !== "submitted") {
          currentData.status = "draft";
        } else if (currentData.status === "none") {
          currentData.status = entry.status;
        }
        
        ataChapterData[chapter] = currentData;
      }
    }
  });

  // Convert to simple hours map for backward compatibility
  const ataChapterHours: Record<string, number> = {};
  Object.keys(ataChapterData).forEach((chapter) => {
    ataChapterHours[chapter] = ataChapterData[chapter].hours;
  });

  const chaptersWithHours = Object.keys(ataChapterHours).length;

  return {
    apprentice,
    totalHours,
    currentWeek,
    totalWeeks,
    expectedHours,
    hoursDifference,
    approvedCount,
    ataChapterHours,
    ataChapterData,
    chaptersWithHours,
    logbookEntries: logbookEntries || [],
  };
}

export default async function ProgressPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const progressData = await getProgressData(user.id);

  if (progressData === null) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progress Tracking</h1>
          <p className="text-muted-foreground mt-2">
            No apprentice record found. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Progress Tracking</h1>
        <p className="text-muted-foreground text-lg">
          Track your progress through the 30-month program
        </p>
      </div>

      <ProgressTrackingDashboard progressData={progressData} />
    </div>
  );
}
