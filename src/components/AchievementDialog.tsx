import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RankCard } from "./RankCard";
import { BadgeDisplay } from "./BadgeDisplay";
import type { UserData } from "@/lib/storage";

interface AchievementDialogProps {
  unlockedCount: number;
  userData: UserData | null;
}

export const AchievementDialog = ({ unlockedCount, userData }: AchievementDialogProps) => {
  if (!userData) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-12 relative"
        >
          <Trophy className="w-5 h-5 text-primary" />
          <span className="font-medium text-primary">Achievements</span>
          {unlockedCount > 0 && (
            <Badge variant="secondary" className="ml-auto h-5 px-2 flex items-center justify-center text-xs">
              {unlockedCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl">🏆 Your Achievements</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="rank" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rank">Rank</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="rank" className="py-4">
            <RankCard xp={userData.xp} rank={userData.rank} />
          </TabsContent>

          <TabsContent value="badges" className="py-4">
            <BadgeDisplay badges={userData.badges} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
