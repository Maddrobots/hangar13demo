"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  TrendingDown,
  TrendingUp,
  Target,
  Award,
  Waves,
} from "lucide-react";
import { AtaChapterCoverage } from "./ata-chapter-coverage";
import { MilestonesTimeline } from "./milestones-timeline";
import { AddEntryModal } from "./add-entry-modal";
import { cn } from "@/lib/utils";

interface ProgressData {
  apprentice: {
    start_date: string;
  };
  totalHours: number;
  currentWeek: number;
  totalWeeks: number;
  expectedHours: number;
  hoursDifference: number;
  approvedCount: number;
  ataChapterHours: Record<string, number>;
  ataChapterData?: Record<string, { hours: number; status: string }>;
  chaptersWithHours: number;
  logbookEntries: Array<{
    id: string;
    entry_date: string;
    hours_worked: number;
    description: string;
    skills_practiced?: string[] | null;
    status: string;
  }>;
}

interface ProgressTrackingDashboardProps {
  progressData: ProgressData;
}

export function ProgressTrackingDashboard({
  progressData,
}: ProgressTrackingDashboardProps) {
  const {
    totalHours,
    currentWeek,
    totalWeeks,
    expectedHours,
    hoursDifference,
    approvedCount,
    ataChapterHours,
    chaptersWithHours,
    logbookEntries,
  } = progressData;

  const [selectedEntry, setSelectedEntry] = useState<ProgressData["logbookEntries"][0] | null>(null);

  const targetHours = 5200;
  const percentageComplete = Math.round((currentWeek / totalWeeks) * 100);
  const totalATAChapters = 46;

  return (
    <div className="space-y-6">
      {/* Overall Program Progress */}
      <Card className="bg-[#6C5067] border-[#6C5067]">
        <CardContent className="p-6 pt-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Overall Program Progress
              </h2>
              <p className="text-white/80 mt-1">
                Week {currentWeek} of {totalWeeks}
              </p>
            </div>
            <div className="text-3xl font-bold text-white">
              {percentageComplete}% Complete
            </div>
          </div>
          <Progress value={percentageComplete} className="h-3" />
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/25">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Total Hours
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold">{totalHours}</div>
            <div className="text-xs text-muted-foreground mt-1">
              of {targetHours.toLocaleString()} target
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/25">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Waves className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Pace Status
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold">{hoursDifference >= 0 ? "+" : ""}{hoursDifference}h</div>
            <div className="text-xs text-muted-foreground mt-1">
              {hoursDifference < 0 ? "Behind schedule" : "Ahead of schedule"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/25">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  ATA Chapters
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold">{chaptersWithHours}</div>
            <div className="text-xs text-muted-foreground mt-1">
              of {totalATAChapters} covered
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/25">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Weeks Approved
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <div className="text-xs text-muted-foreground mt-1">
              submissions
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hours Progress Section */}
      <Card className="bg-card/25">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-1">{totalHours} hours logged</h3>
              </div>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <div className="text-muted-foreground">Expected:</div>
                  <div className="font-semibold mt-1">{expectedHours}h</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Actual:</div>
                  <div className="font-semibold mt-1">{totalHours}h</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Difference:</div>
                  <div className={cn(
                    "font-semibold mt-1",
                    hoursDifference >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {hoursDifference >= 0 ? "+" : ""}{hoursDifference}h
                  </div>
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground text-right">
              {targetHours.toLocaleString()} target hours
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ATA Chapter Coverage */}
      <AtaChapterCoverage 
        ataChapterHours={ataChapterHours}
        ataChapterData={progressData.ataChapterData}
        logbookEntries={logbookEntries}
        onChapterClick={(entry) => setSelectedEntry(entry)}
      />

      {/* Milestones */}
      <MilestonesTimeline currentWeek={currentWeek} />

      {/* Modal for selected entry */}
      {selectedEntry && (
        <AddEntryModal
          entry={selectedEntry}
          viewOnly={selectedEntry.status !== "draft"}
          open={!!selectedEntry}
          onOpenChange={(open) => {
            if (!open) setSelectedEntry(null);
          }}
          onSuccess={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
}
