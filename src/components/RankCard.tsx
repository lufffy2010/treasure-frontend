import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RANKS, getRankByXP, getNextRank } from "@/lib/rankSystem";
import { RankMapDialog } from "./RankMapDialog";

interface RankCardProps {
  xp: number;
  rank: number;
}

export const RankCard = ({ xp, rank }: RankCardProps) => {
  const currentRank = getRankByXP(xp);
  const nextRank = getNextRank(currentRank.level);
  
  const progressToNext = nextRank 
    ? ((xp - currentRank.xpRequired) / (nextRank.xpRequired - currentRank.xpRequired)) * 100
    : 100;

  return (
    <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-2 border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
            <span className="relative text-5xl sm:text-6xl drop-shadow-lg">{currentRank.icon}</span>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 tracking-tight">{currentRank.name}</h3>
            <p className="text-sm sm:text-base text-primary font-medium">{currentRank.tier}</p>
          </div>
        </div>
        <Badge variant="default" className="text-base sm:text-lg px-4 py-2 shadow-md">
          Level {currentRank.level}
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm sm:text-base">
          <span className="text-muted-foreground font-medium">XP Progress</span>
          <span className="font-bold text-primary text-base sm:text-lg">
            {xp.toLocaleString()} / {nextRank ? nextRank.xpRequired.toLocaleString() : currentRank.xpRequired.toLocaleString()} XP
          </span>
        </div>
        <Progress value={progressToNext} className="h-3 sm:h-4" />
        {nextRank && (
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-muted/50 rounded-lg border border-border">
            <span className="text-muted-foreground font-medium">Next Rank:</span>
            <span className="text-2xl sm:text-3xl">{nextRank.icon}</span>
            <span className="font-bold text-foreground text-base sm:text-lg">{nextRank.name}</span>
          </div>
        )}
        {!nextRank && (
          <div className="text-center p-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg border-2 border-primary/40">
            <p className="text-primary font-bold text-lg sm:text-xl">✨ Maximum Rank Achieved! ✨</p>
            <p className="text-sm text-muted-foreground mt-1">You've reached the peak of excellence!</p>
          </div>
        )}
      </div>

      <RankMapDialog currentXP={xp} />
    </Card>
  );
};
