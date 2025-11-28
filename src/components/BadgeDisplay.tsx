import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { BADGE_DEFINITIONS } from "@/lib/badgeSystem";
import { Badge as BadgeType } from "@/lib/storage";

interface BadgeDisplayProps {
  badges: BadgeType[];
}

export const BadgeDisplay = ({ badges }: BadgeDisplayProps) => {
  const unlockedBadgeIds = (badges || []).map(b => b.id);
  
  const categorizedBadges = {
    willpower: BADGE_DEFINITIONS.filter(b => b.category === "willpower"),
    treasure: BADGE_DEFINITIONS.filter(b => b.category === "treasure"),
    sea_spirit: BADGE_DEFINITIONS.filter(b => b.category === "sea_spirit"),
    legacy: BADGE_DEFINITIONS.filter(b => b.category === "legacy"),
  };

  const categoryNames = {
    willpower: "Willpower",
    treasure: "Treasure",
    sea_spirit: "Sea Spirit",
    legacy: "Legacy",
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-primary" />
        <h3 className="text-2xl font-bold">Adventure Badges</h3>
        <Badge variant="secondary" className="ml-auto">
          {unlockedBadgeIds.length}/{BADGE_DEFINITIONS.length}
        </Badge>
      </div>

      <div className="space-y-6">
        {Object.entries(categorizedBadges).map(([category, badgeList]) => (
          <div key={category}>
            <h4 className="text-lg font-semibold mb-3 text-primary">
              {categoryNames[category as keyof typeof categoryNames]}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {badgeList.map((badgeDef) => {
                const isUnlocked = unlockedBadgeIds.includes(badgeDef.id);
                return (
                  <div
                    key={badgeDef.id}
                    className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                      isUnlocked
                        ? "bg-success/10 border-success shadow-lg"
                        : "bg-muted/20 border-border opacity-50"
                    }`}
                  >
                    <span className={`text-4xl mb-2 ${isUnlocked ? "" : "grayscale"}`}>
                      {badgeDef.icon}
                    </span>
                    <h5 className="text-sm font-semibold text-center text-foreground">
                      {badgeDef.name}
                    </h5>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      {badgeDef.description}
                    </p>
                    {isUnlocked && (
                      <Badge variant="outline" className="mt-2 text-xs bg-success/20 border-success">
                        ✓ Unlocked
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
