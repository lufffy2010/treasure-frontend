import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";

interface StreakCardProps {
  streaks: string[];
  onToggleStreak: (date: Date) => void;
}

export const StreakCard = ({ streaks }: StreakCardProps) => {
  const currentStreak = streaks.length;
  
  const getCircleProgress = () => {
    const milestone = Math.ceil(currentStreak / 10) * 10 || 10;
    const progress = (currentStreak / milestone) * 100;
    return { progress, milestone };
  };

  const { progress, milestone } = getCircleProgress();
  const circumference = 2 * Math.PI * 50;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getStreakMessage = () => {
    if (currentStreak >= 40) return "Legendary! 🔥";
    if (currentStreak >= 30) return "On fire! 🚀";
    if (currentStreak >= 20) return "Great momentum! ⭐";
    if (currentStreak >= 10) return "Keep it up! 💪";
    return "Start your streak!";
  };

  return (
    <Card className="group p-6 shadow-card hover:shadow-elevated transition-all duration-300 bg-gradient-to-br from-card to-primary/5 border-2 hover:border-primary/30">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted opacity-30"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Flame className="w-10 h-10 text-primary animate-fire-flicker group-hover:scale-110 transition-transform" />
              <div className="text-xs text-muted-foreground mt-1">/{milestone}</div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-bold text-primary group-hover:scale-105 transition-transform">{currentStreak}</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
              Day Streak
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="text-lg font-semibold text-foreground text-right">
            {getStreakMessage()}
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-700 ease-out shadow-glow"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
