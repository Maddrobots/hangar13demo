"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createLogbookEntry, updateLogbookEntry } from "@/app/actions/logbook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, Plus, Clock, Calendar, Save, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const logbookEntrySchema = z
  .object({
    entryDate: z.string().min(1, "Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    taskDescription: z
      .string()
      .min(10, "Task description must be at least 10 characters")
      .max(500, "Task description cannot exceed 500 characters"),
    ataChapter: z.string().min(1, "ATA Chapter is required"),
    certified: z.boolean(),
  })
  .refine((data) => {
    // Validate that end time is after start time
    const start = new Date(`2000-01-01 ${data.startTime}`);
    const end = new Date(`2000-01-01 ${data.endTime}`);
    return end > start;
  }, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

type LogbookEntryFormData = z.infer<typeof logbookEntrySchema>;

const ataChapters = [
  { value: "00", label: "00 - General" },
  { value: "05", label: "05 - Time Limits/Maintenance Checks" },
  { value: "06", label: "06 - Dimensions & Areas" },
  { value: "07", label: "07 - Lifting & Shoring" },
  { value: "08", label: "08 - Leveling & Weighing" },
  { value: "09", label: "09 - Towing & Taxiing" },
  { value: "10", label: "10 - Parking, Mooring, Storage" },
  { value: "11", label: "11 - Placards & Markings" },
  { value: "12", label: "12 - Servicing" },
  { value: "20", label: "20 - Standard Practices - Airframe" },
  { value: "21", label: "21 - Air Conditioning" },
  { value: "23", label: "23 - Communications" },
  { value: "24", label: "24 - Electrical Power" },
  { value: "25", label: "25 - Equipment/Furnishings" },
  { value: "26", label: "26 - Fire Protection" },
  { value: "27", label: "27 - Flight Controls" },
  { value: "28", label: "28 - Fuel" },
  { value: "29", label: "29 - Hydraulic Power" },
  { value: "30", label: "30 - Ice & Rain Protection" },
  { value: "31", label: "31 - Indicating/Recording Systems" },
  { value: "32", label: "32 - Landing Gear" },
  { value: "33", label: "33 - Lights" },
  { value: "34", label: "34 - Navigation" },
  { value: "35", label: "35 - Oxygen" },
  { value: "36", label: "36 - Pneumatic" },
  { value: "38", label: "38 - Water/Waste" },
  { value: "49", label: "49 - Airborne Auxiliary Power" },
  { value: "51", label: "51 - Structures" },
  { value: "52", label: "52 - Doors" },
  { value: "53", label: "53 - Fuselage" },
  { value: "54", label: "54 - Nacelles/Pylons" },
  { value: "55", label: "55 - Stabilizers" },
  { value: "56", label: "56 - Windows" },
  { value: "57", label: "57 - Wings" },
  { value: "61", label: "61 - Propellers/Propulsors" },
  { value: "71", label: "71 - Powerplant" },
  { value: "72", label: "72 - Engine - Turbine/Turbo Prop" },
  { value: "73", label: "73 - Engine Fuel & Control" },
  { value: "74", label: "74 - Ignition" },
  { value: "75", label: "75 - Air" },
  { value: "76", label: "76 - Engine Controls" },
  { value: "77", label: "77 - Engine Indicating" },
  { value: "78", label: "78 - Exhaust" },
  { value: "79", label: "79 - Oil" },
  { value: "80", label: "80 - Starting" },
  { value: "91", label: "91 - Charts" },
];

function calculateHours(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;

  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const start = startHours * 60 + startMinutes;
  const end = endHours * 60 + endMinutes;

  // Handle overnight (end time is next day)
  const diff = end < start ? 24 * 60 - start + end : end - start;

  return Math.round((diff / 60) * 100) / 100; // Round to 2 decimal places
}

// Extract ATA chapter code from stored format "ATA: XX - Name"
function extractATAChapterCode(ataLabel: string | null | undefined): string {
  if (!ataLabel) return "";
  const match = ataLabel.match(/^(\d+)\s*-/);
  return match ? match[1] : "";
}

interface AddEntryModalProps {
  onSuccess?: () => void;
  entry?: {
    id: string;
    entry_date: string;
    hours_worked: number;
    description: string;
    skills_practiced?: string[] | null;
    status: string;
  };
  trigger?: React.ReactNode;
  viewOnly?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddEntryModal({ 
  onSuccess, 
  entry, 
  trigger, 
  viewOnly = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: AddEntryModalProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(!!entry && !trigger); // Auto-open if entry provided without trigger
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;
  
  const handleClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      onSuccess?.(); // Call onSuccess to clear selected entry in parent
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const isEditMode = !!entry;
  const isViewMode = viewOnly || (entry && entry.status !== "draft");

  // Extract ATA chapter from existing entry
  const existingATAChapter = entry?.skills_practiced?.[0]?.replace(/^ATA:\s*/, "") || "";
  const ataChapterCode = extractATAChapterCode(existingATAChapter);

  // Calculate default times from hours (assuming 8am start)
  const defaultStartTime = "08:00";
  const calculateEndTime = (hours: number) => {
    const startMinutes = 8 * 60; // 8am
    const totalMinutes = startMinutes + Math.round(hours * 60);
    const hours24 = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${hours24.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<LogbookEntryFormData>({
    resolver: zodResolver(logbookEntrySchema),
    defaultValues: {
      entryDate: entry?.entry_date || new Date().toISOString().split("T")[0],
      startTime: defaultStartTime,
      endTime: entry?.hours_worked ? calculateEndTime(entry.hours_worked) : "17:00",
      taskDescription: entry?.description || "",
      ataChapter: ataChapterCode,
      certified: entry?.status === "submitted" || false,
    },
  });

  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const taskDescription = watch("taskDescription");
  const ataChapter = watch("ataChapter");
  const certified = watch("certified");

  // Check if form is valid for submission
  const isFormValid = ataChapter && taskDescription && taskDescription.length >= 10;

  const totalHours = useMemo(() => {
    return calculateHours(startTime, endTime);
  }, [startTime, endTime]);

  // Reset form when entry changes or modal opens/closes
  useEffect(() => {
    if (isOpen && entry) {
      const existingATAChapter = entry.skills_practiced?.[0]?.replace(/^ATA:\s*/, "") || "";
      const ataChapterCode = extractATAChapterCode(existingATAChapter);
      const defaultStartTime = "08:00";
      const calculateEndTime = (hours: number) => {
        const startMinutes = 8 * 60;
        const totalMinutes = startMinutes + Math.round(hours * 60);
        const hours24 = Math.floor(totalMinutes / 60) % 24;
        const minutes = totalMinutes % 60;
        return `${hours24.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      };

      reset({
        entryDate: entry.entry_date,
        startTime: defaultStartTime,
        endTime: entry.hours_worked ? calculateEndTime(entry.hours_worked) : "17:00",
        taskDescription: entry.description,
        ataChapter: ataChapterCode,
        certified: entry.status === "submitted" || false,
      });
    } else if (isOpen && !entry) {
      reset({
        entryDate: new Date().toISOString().split("T")[0],
        startTime: "08:00",
        endTime: "17:00",
        taskDescription: "",
        ataChapter: "",
        certified: false,
      });
    }
  }, [isOpen, entry, reset]);

  const onSubmit = async (data: LogbookEntryFormData) => {
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsSubmitting(true);

    try {
      const result = isEditMode
        ? await updateLogbookEntry(entry!.id, {
            entryDate: data.entryDate,
            startTime: data.startTime,
            endTime: data.endTime,
            hoursWorked: totalHours,
            taskDescription: data.taskDescription,
            ataChapter: data.ataChapter,
            certified: data.certified,
          })
        : await createLogbookEntry({
            entryDate: data.entryDate,
            startTime: data.startTime,
            endTime: data.endTime,
            hoursWorked: totalHours,
            taskDescription: data.taskDescription,
            ataChapter: data.ataChapter,
            certified: data.certified,
          });

      if (result.error) {
        setSubmitError(result.error);
        setIsSubmitting(false);
        return;
      }

      setSubmitSuccess(true);
      reset();
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsOpen(false);
        router.refresh();
        onSuccess?.();
      }, 1500);
      setIsSubmitting(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isViewMode ? "View Logbook Entry" : isEditMode ? "Edit Logbook Entry" : "New Logbook Entry"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={isViewMode ? (e) => e.preventDefault() : handleSubmit(onSubmit)} className="space-y-6">
          {submitError && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="rounded-md border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
              <Check className="h-4 w-4" />
              {isEditMode
                ? "Logbook entry updated successfully!"
                : "Logbook entry created successfully!"}
            </div>
          )}

          {/* Date Input */}
          <div className="space-y-2">
            <Label htmlFor="entryDate">Date</Label>
            <div className="relative">
              <Input
                id="entryDate"
                type="date"
                {...register("entryDate")}
                aria-invalid={errors.entryDate ? "true" : "false"}
                className="pr-10"
                disabled={isViewMode}
              />
              <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            {errors.entryDate && (
              <p className="text-sm text-destructive">
                {errors.entryDate.message}
              </p>
            )}
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="taskDescription">Task Description</Label>
            <Textarea
              id="taskDescription"
              placeholder="Describe the work you performed..."
              {...register("taskDescription")}
              rows={4}
              maxLength={500}
              aria-invalid={errors.taskDescription ? "true" : "false"}
              className="resize-none"
              disabled={isViewMode}
            />
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                {taskDescription?.length || 0}/500 characters
              </div>
              {errors.taskDescription && (
                <p className="text-sm text-destructive">
                  {errors.taskDescription.message}
                </p>
              )}
            </div>
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <div className="relative">
                <Input
                  id="startTime"
                  type="time"
                  {...register("startTime")}
                  aria-invalid={errors.startTime ? "true" : "false"}
                  className="pr-10"
                  disabled={isViewMode}
                />
                <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              {errors.startTime && (
                <p className="text-sm text-destructive">
                  {errors.startTime.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <div className="relative">
                <Input
                  id="endTime"
                  type="time"
                  {...register("endTime")}
                  aria-invalid={errors.endTime ? "true" : "false"}
                  className="pr-10"
                  disabled={isViewMode}
                />
                <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              {errors.endTime && (
                <p className="text-sm text-destructive">
                  {errors.endTime.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Total Hours</Label>
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 border border-primary/20",
                  "text-primary font-semibold"
                )}
              >
                <Clock className="h-4 w-4" />
                <span>{totalHours}h</span>
              </div>
            </div>
          </div>

          {/* ATA Chapter */}
          <div className="space-y-2">
            <Label htmlFor="ataChapter">ATA Chapter</Label>
            <Select
              value={watch("ataChapter")}
              onValueChange={(value) => {
                setValue("ataChapter", value, { shouldValidate: true });
              }}
              disabled={isViewMode}
            >
              <SelectTrigger id="ataChapter" disabled={isViewMode}>
                <SelectValue placeholder="Select ATA Chapter" />
              </SelectTrigger>
              <SelectContent>
                {ataChapters.map((chapter) => (
                  <SelectItem key={chapter.value} value={chapter.value}>
                    {chapter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.ataChapter && (
              <p className="text-sm text-destructive">
                {errors.ataChapter.message}
              </p>
            )}
          </div>

          {/* Certification Checkbox */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="certified"
                {...register("certified")}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                disabled={isViewMode}
              />
              <div className="flex-1">
                <Label htmlFor="certified" className="font-normal cursor-pointer">
                  I certify this information is accurate
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  By checking this box, you confirm the work described was
                  performed and the hours are accurate. This will submit the
                  entry for mentor signature.
                </p>
              </div>
            </div>
            {errors.certified && (
              <p className="text-sm text-destructive">
                {errors.certified.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          {!isViewMode && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !isFormValid}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting
                  ? certified
                    ? "Submitting..."
                    : "Saving..."
                  : certified
                    ? "Submit for Signature"
                    : "Save Draft"}
              </Button>
            </div>
          )}
          {isViewMode && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
              >
                Close
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
