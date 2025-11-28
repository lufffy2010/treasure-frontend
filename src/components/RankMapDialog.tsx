import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Map, Ship, Anchor, Waves } from "lucide-react";
import { RANKS, getRankByXP } from "@/lib/rankSystem";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RankMapDialogProps {
  currentXP: number;
}

export const RankMapDialog = ({ currentXP }: RankMapDialogProps) => {
  const currentRank = getRankByXP(currentXP);
  
  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      "Call to the Sea": "from-blue-400/20 to-cyan-400/20 border-blue-400/40",
      "Into the Wild Blue": "from-cyan-400/20 to-teal-400/20 border-cyan-400/40",
      "Trials of Courage": "from-teal-400/20 to-emerald-400/20 border-teal-400/40",
      "Uncharted Path": "from-purple-400/20 to-pink-400/20 border-purple-400/40",
      "Destiny Road": "from-amber-400/20 to-orange-400/20 border-amber-400/40",
      "The Final Title": "from-yellow-300/20 to-amber-300/20 border-yellow-400/60",
    };
    return colors[tier] || "from-primary/20 to-secondary/20 border-primary/40";
  };

  const groupedRanks = RANKS.reduce((acc, rank) => {
    if (!acc[rank.tier]) {
      acc[rank.tier] = [];
    }
    acc[rank.tier].push(rank);
    return acc;
  }, {} as Record<string, typeof RANKS>);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 w-full mt-4">
          <Map className="w-4 h-4" />
          View Adventure Map
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl md:text-3xl flex items-center gap-2 sm:gap-3 justify-center flex-wrap">
            <Ship className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-pulse" />
            <span className="text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">Adventure Map</span>
            <Waves className="w-6 h-6 sm:w-8 sm:h-8 text-accent animate-pulse" />
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] sm:h-[70vh] pr-2 sm:pr-4">
          <div className="relative">
            {/* Decorative wave pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-500 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-500 to-transparent" />
            </div>

            <div className="relative space-y-6 sm:space-y-8 py-2 sm:py-4">
              {Object.entries(groupedRanks).map(([tier, ranks], tierIndex) => (
                <div key={tier} className="relative">
                  {/* Tier Header */}
                  <div className={`bg-gradient-to-r ${getTierColor(tier)} border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg hover:shadow-xl transition-all duration-300`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Anchor className="w-6 h-6 sm:w-8 sm:h-8 text-primary shrink-0 animate-pulse" />
                        <div>
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground">
                            Tier {tierIndex + 1}: {tier}
                          </h3>
                          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                            {ranks.length} Ranks to conquer
                          </p>
                        </div>
                      </div>
                      {ranks.some(r => r.level === currentRank.level) && (
                        <Badge variant="default" className="text-xs sm:text-sm md:text-base px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 shrink-0 shadow-lg animate-pulse">
                          <Ship className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          You Are Here!
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Ranks in this tier */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 pl-4 sm:pl-8">
                    {ranks.map((rank, idx) => {
                      const isUnlocked = currentXP >= rank.xpRequired;
                      const isCurrent = rank.level === currentRank.level;
                      
                      return (
                        <div
                          key={rank.level}
                          className={`relative group transition-all duration-300 ${
                            isCurrent ? "scale-105" : ""
                          }`}
                        >
                          {/* Connection line to next rank - hidden on mobile */}
                          {idx < ranks.length - 1 && (
                            <div className={`hidden sm:block absolute top-1/2 -right-2 w-4 h-0.5 ${
                              isUnlocked ? "bg-success" : "bg-border"
                            }`} />
                          )}
                          
                          <div
                            className={`relative rounded-lg sm:rounded-xl border-2 p-3 sm:p-4 md:p-6 transition-all duration-300 ${
                              isCurrent
                                ? "bg-gradient-to-br from-primary/20 to-accent/20 border-primary shadow-xl ring-2 sm:ring-4 ring-primary/30 scale-105"
                                : isUnlocked
                                ? "bg-gradient-to-br from-success/10 to-success/5 border-success hover:shadow-lg hover:scale-105"
                                : "bg-muted/30 border-border opacity-60 hover:opacity-80"
                            }`}
                          >
                            {/* Ship indicator for current rank */}
                            {isCurrent && (
                              <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 animate-bounce">
                                <div className="bg-primary text-primary-foreground rounded-full p-1.5 sm:p-2 shadow-lg ring-2 ring-primary/50">
                                  <Ship className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                </div>
                              </div>
                            )}

                            <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-2 md:space-y-3">
                              <div className="relative">
                                <span className={`text-2xl sm:text-3xl md:text-4xl ${isUnlocked ? "drop-shadow-lg" : "grayscale"}`}>
                                  {rank.icon}
                                </span>
                                {isUnlocked && (
                                  <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-success rounded-full flex items-center justify-center shadow-md">
                                      <span className="text-white text-[10px] sm:text-xs">✓</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <Badge variant={isCurrent ? "default" : "outline"} className="mb-1 sm:mb-2 text-[10px] sm:text-xs md:text-sm">
                                  Lv. {rank.level}
                                </Badge>
                                <h4 className={`font-bold text-xs sm:text-sm md:text-base leading-tight ${
                                  isCurrent ? "text-primary" : isUnlocked ? "text-foreground" : "text-muted-foreground"
                                }`}>
                                  {rank.name}
                                </h4>
                                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">
                                  {rank.xpRequired.toLocaleString()} XP
                                </p>
                                {!isUnlocked && (
                                  <p className="text-[10px] sm:text-xs text-destructive mt-0.5 sm:mt-1 font-medium">
                                    {(rank.xpRequired - currentXP).toLocaleString()} XP needed
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tier connector */}
                  {tierIndex < Object.keys(groupedRanks).length - 1 && (
                    <div className="flex items-center justify-center my-4 sm:my-6">
                      <div className="h-8 sm:h-12 w-0.5 bg-gradient-to-b from-border via-primary to-border" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Ship className="w-4 h-4 text-primary shrink-0" />
              <span className="font-semibold">Current:</span>
              <span className="truncate">{currentRank.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Total XP:</span>
              <Badge variant="secondary" className="shrink-0">{currentXP} XP</Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
