import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  completed: number;
  total: number;
}

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="py-2 gap-0">
      <div className="pb-1 px-4 pt-4">
        <div className="flex items-center justify-between gap-2 text-base">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="font-semibold leading-none">Overall Program Progress</span>
          </div>
          <span className="font-bold text-primary">{percentage}%</span>
        </div>
      </div>
      <div className="px-4 pb-4 pt-1">
        <Progress value={percentage} className="h-3" />
      </div>
    </div>
  );
}

