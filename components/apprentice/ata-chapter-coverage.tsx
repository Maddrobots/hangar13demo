"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AtaChapterCoverageProps {
  ataChapterHours: Record<string, number>;
  ataChapterData?: Record<string, { hours: number; status: string }>;
  logbookEntries?: Array<{
    id: string;
    entry_date: string;
    hours_worked: number;
    description: string;
    skills_practiced?: string[] | null;
    status: string;
  }>;
  onChapterClick?: (entry: {
    id: string;
    entry_date: string;
    hours_worked: number;
    description: string;
    skills_practiced?: string[] | null;
    status: string;
  }) => void;
}

// ATA chapters with labels (from the log entry modal)
const ataChaptersMap: Record<string, string> = {
  "00": "00 - General",
  "05": "05 - Time Limits/Maintenance Checks",
  "06": "06 - Dimensions & Areas",
  "07": "07 - Lifting & Shoring",
  "08": "08 - Leveling & Weighing",
  "09": "09 - Towing & Taxiing",
  "10": "10 - Parking, Mooring, Storage",
  "11": "11 - Placards & Markings",
  "12": "12 - Servicing",
  "20": "20 - Standard Practices - Airframe",
  "21": "21 - Air Conditioning",
  "23": "23 - Communications",
  "24": "24 - Electrical Power",
  "25": "25 - Equipment/Furnishings",
  "26": "26 - Fire Protection",
  "27": "27 - Flight Controls",
  "28": "28 - Fuel",
  "29": "29 - Hydraulic Power",
  "30": "30 - Ice & Rain Protection",
  "31": "31 - Indicating/Recording Systems",
  "32": "32 - Landing Gear",
  "33": "33 - Lights",
  "34": "34 - Navigation",
  "35": "35 - Oxygen",
  "36": "36 - Pneumatic",
  "38": "38 - Water/Waste",
  "49": "49 - Airborne Auxiliary Power",
  "51": "51 - Structures",
  "52": "52 - Doors",
  "53": "53 - Fuselage",
  "54": "54 - Nacelles/Pylons",
  "55": "55 - Stabilizers",
  "56": "56 - Windows",
  "57": "57 - Wings",
  "61": "61 - Propellers/Propulsors",
  "71": "71 - Powerplant",
  "72": "72 - Engine - Turbine/Turbo Prop",
  "73": "73 - Engine Fuel & Control",
  "74": "74 - Ignition",
  "75": "75 - Air",
  "76": "76 - Engine Controls",
  "77": "77 - Engine Indicating",
  "78": "78 - Exhaust",
  "79": "79 - Oil",
  "80": "80 - Starting",
  "91": "91 - Charts",
};

// ATA chapters in order
const ataChapters = [
  "00", "05", "06", "07", "08", "09", "10", "11", "12",
  "20", "21", "23", "24", "25", "26", "27", "28", "29",
  "30", "31", "32", "33", "34", "35", "36", "38", "49",
  "51", "52", "53", "54", "55", "56", "57",
  "61",
  "71", "72", "73", "74", "75", "76", "77", "78", "79", "80",
  "91",
];

export function AtaChapterCoverage({ 
  ataChapterHours, 
  ataChapterData,
  logbookEntries = [],
  onChapterClick
}: AtaChapterCoverageProps) {
  const totalChapters = 46;
  const chaptersWithHours = Object.keys(ataChapterHours).length;

  const getCellColor = (hours: number) => {
    if (hours === 0) {
      return "bg-[#F5F0E8]"; // Lightest beige
    } else if (hours >= 1 && hours <= 9) {
      return "bg-[#CC5A2A]"; // Orange-brown
    } else {
      return "bg-green-500"; // Green for 10+ hrs
    }
  };

  return (
    <Card className="bg-card/25">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>ATA Chapter Coverage</CardTitle>
          <span className="text-sm text-muted-foreground">
            {chaptersWithHours} of {totalChapters} chapters
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-1 mb-4">
          {ataChapters.map((chapter) => {
            const hours = ataChapterHours[chapter] || 0;
            const chapterData = ataChapterData?.[chapter];
            const status = chapterData?.status || "none";
            const chapterTitle = ataChaptersMap[chapter] || `ATA ${chapter}`;
            
            // Format status for display
            const getStatusLabel = (status: string) => {
              switch (status) {
                case "draft":
                  return "Draft";
                case "submitted":
                  return "Pending Signature";
                case "approved":
                  return "Approved";
                default:
                  return null;
              }
            };

            const statusLabel = getStatusLabel(status);
            const tooltipText = statusLabel
              ? `${chapterTitle}\n${hours}h logged\nStatus: ${statusLabel}`
              : `${chapterTitle}\n${hours}h logged`;

            // Find the most recent entry for this chapter
            const findEntryForChapter = (chapterCode: string) => {
              return logbookEntries
                .filter((entry) => {
                  if (!entry.skills_practiced || entry.skills_practiced.length === 0) return false;
                  const ataMatch = entry.skills_practiced[0]?.match(/ATA:\s*(\d+)\s*-/);
                  return ataMatch && ataMatch[1] === chapterCode;
                })
                .sort((a, b) => {
                  // Sort by date, most recent first
                  return new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime();
                })[0];
            };

            const entryForChapter = hours > 0 ? findEntryForChapter(chapter) : null;

            const handleClick = () => {
              if (entryForChapter && onChapterClick) {
                onChapterClick(entryForChapter);
              }
            };

            return (
              <div
                key={chapter}
                className={cn(
                  "aspect-square rounded border border-gray-300 flex items-center justify-center text-[16px] font-medium",
                  getCellColor(hours),
                  hours > 0 ? "text-white" : "text-gray-400",
                  entryForChapter ? "cursor-pointer hover:opacity-80" : "cursor-default"
                )}
                title={tooltipText}
                onClick={handleClick}
              >
                {chapter}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-gray-300 bg-[#F5F0E8]"></div>
            <span className="text-muted-foreground">0 hrs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-gray-300 bg-[#CC5A2A]"></div>
            <span className="text-muted-foreground">1-9 hrs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-gray-300 bg-green-500"></div>
            <span className="text-muted-foreground">10+ hrs</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
