"use client";

import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, Calendar, Clock, Target, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface AssignedApprentice {
  id: string;
  user_id: string;
  start_date: string;
  status: string;
  profiles: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  progress?: {
    overall: number;
    completed: number;
    total: number;
  };
  hours?: {
    total: number;
    target: number;
    progress: number;
  };
  weeks?: {
    current: number;
  };
  progressStatus?: "on_track" | "behind_pace" | "ahead";
  pendingEntries?: number;
}

interface AssignedApprenticesListProps {
  apprentices: AssignedApprentice[];
}

export function AssignedApprenticesList({
  apprentices,
}: AssignedApprenticesListProps) {
  const router = useRouter();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCardClick = (apprenticeId: string) => {
    router.push(`/dashboard/mentor/apprentice/${apprenticeId}`);
  };

  const handlePendingEntriesClick = (e: React.MouseEvent, apprenticeName?: string | null, apprenticeEmail?: string) => {
    e.stopPropagation();
    e.preventDefault();
    const name = apprenticeName || apprenticeEmail || "";
    router.push(`/dashboard/mentor/review-logs?apprentice=${encodeURIComponent(name)}`);
  };

  const getStatusBadge = (progressStatus?: "on_track" | "behind_pace" | "ahead") => {
    switch (progressStatus) {
      case "on_track":
        return (
          <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            On Track
          </span>
        );
      case "behind_pace":
        return (
          <span className="px-2 py-1 rounded-full bg-red-500/10 text-red-600 text-xs font-medium flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Behind Pace
          </span>
        );
      case "ahead":
        return (
          <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-medium flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Ahead
          </span>
        );
      default:
        return null;
    }
  };

  if (apprentices.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No assigned apprentices yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {apprentices.map((apprentice) => (
        <Card
          key={apprentice.id}
          className="bg-card/25 border-2 transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer h-full"
          onClick={() => handleCardClick(apprentice.id)}
        >
          <CardContent className="pt-6">
            <div className="space-y-4">
                {/* Header with Avatar and Name */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {apprentice.profiles?.avatar_url ? (
                      <img
                        src={apprentice.profiles.avatar_url}
                        alt={apprentice.profiles.full_name || "Apprentice"}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg truncate">
                      {apprentice.profiles?.full_name || "Unnamed Apprentice"}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{apprentice.profiles?.email}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                {getStatusBadge(apprentice.progressStatus)}

                {/* Progress Stats */}
                <div className="space-y-3 pt-2 border-t border-border">
                  {/* Overall Progress */}
                  {apprentice.progress && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Overall Progress</span>
                        <span className="font-semibold">{apprentice.progress.overall}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${apprentice.progress.overall}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {apprentice.progress.completed} of {apprentice.progress.total} items completed
                      </div>
                    </div>
                  )}

                  {/* Current Week */}
                  {apprentice.weeks && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Current Week
                      </span>
                      <span className="font-semibold">Week {apprentice.weeks.current}</span>
                    </div>
                  )}

                  {/* Hours Progress */}
                  {apprentice.hours && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Hours Progress
                        </span>
                        <span className="font-semibold">
                          {apprentice.hours.total.toFixed(1)} / {apprentice.hours.target}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${Math.min(apprentice.hours.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Pending Entries */}
                  {apprentice.pendingEntries !== undefined && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between hover:bg-primary/10"
                      onClick={(e) => handlePendingEntriesClick(e, apprentice.profiles?.full_name, apprentice.profiles?.email)}
                    >
                      <span className="text-muted-foreground flex items-center gap-1 text-sm">
                        <Target className="h-3 w-3" />
                        Pending Logbook Entries
                      </span>
                      <span className={`font-semibold text-sm ${apprentice.pendingEntries > 0 ? "text-primary" : ""}`}>
                        {apprentice.pendingEntries}
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
      ))}
    </div>
  );
}