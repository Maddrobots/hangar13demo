"use client";

import { useState, useMemo } from "react";
import { Calendar, Clock, User, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { approveLogbookEntry, rejectLogbookEntry } from "@/app/actions/logbook-approval";
import { useRouter } from "next/navigation";

interface PendingLogbookEntry {
  id: string;
  entry_date: string;
  hours_worked: number;
  description: string;
  skills_practiced: string[] | null;
  challenges_encountered: string | null;
  next_steps: string | null;
  status: string;
  apprentices: {
    id: string;
    profiles: {
      id: string;
      full_name: string | null;
      email: string;
    } | null;
  } | null;
}

interface PendingLogbookEntriesProps {
  entries: PendingLogbookEntry[];
  initialNameFilter?: string;
}

export function PendingLogbookEntries({ entries, initialNameFilter = "" }: PendingLogbookEntriesProps) {
  const router = useRouter();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<"draft" | "pending" | "all">("pending");
  const [nameFilter, setNameFilter] = useState<string>(initialNameFilter);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filter entries based on status and name
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Filter by status
      if (statusFilter === "pending" && entry.status !== "submitted") {
        return false;
      }
      if (statusFilter === "draft" && entry.status !== "draft") {
        return false;
      }
      // "all" shows all entries regardless of status

      // Filter by apprentice name
      if (nameFilter.trim()) {
        const apprenticeName =
          entry.apprentices?.profiles?.full_name?.toLowerCase() ||
          entry.apprentices?.profiles?.email?.toLowerCase() ||
          "";
        const searchTerm = nameFilter.toLowerCase().trim();
        if (!apprenticeName.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }, [entries, statusFilter, nameFilter]);

  const handleApprove = async (entryId: string) => {
    setProcessingIds((prev) => new Set(prev).add(entryId));
    try {
      const result = await approveLogbookEntry(entryId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Failed to approve entry");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(entryId);
        return next;
      });
    }
  };

  const handleReject = async (entryId: string) => {
    setProcessingIds((prev) => new Set(prev).add(entryId));
    try {
      const result = await rejectLogbookEntry(entryId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Failed to reject entry");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(entryId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-end gap-4">
        <div className="space-y-2 flex-1 max-w-xs">
          <Label htmlFor="status-filter">Status</Label>
          <Select
            value={statusFilter}
            onValueChange={(value: "draft" | "pending" | "all") => setStatusFilter(value)}
          >
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 flex-1 max-w-xs">
          <Label htmlFor="name-filter">Apprentice Name</Label>
          <Input
            id="name-filter"
            type="text"
            placeholder="Search by apprentice name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No logbook entries found matching the filters.
          </p>
        ) : (
          filteredEntries.map((entry) => {
            const isProcessing = processingIds.has(entry.id);
            const apprenticeName =
              entry.apprentices?.profiles?.full_name ||
              entry.apprentices?.profiles?.email ||
              "Unknown Apprentice";

            return (
              <div
                key={entry.id}
                className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{apprenticeName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(entry.entry_date)}</span>
                    <Clock className="h-3 w-3 ml-2" />
                    <span>{entry.hours_worked} hrs</span>
                  </div>
                </div>

                <p className="text-sm">{entry.description}</p>

                {entry.skills_practiced && entry.skills_practiced.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.skills_practiced.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {entry.challenges_encountered && (
                  <p className="text-xs text-muted-foreground">
                    <strong>Challenges:</strong> {entry.challenges_encountered}
                  </p>
                )}

                {entry.next_steps && (
                  <p className="text-xs text-muted-foreground">
                    <strong>Next Steps:</strong> {entry.next_steps}
                  </p>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleApprove(entry.id)}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {isProcessing ? "Processing..." : "Approve"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(entry.id)}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
