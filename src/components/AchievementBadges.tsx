import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Target, BookOpen, Clock } from "lucide-react";
import { UserData } from "@/lib/storage";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface AchievementBadgesProps {
  userData: UserData;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: string;
  nextTier?: { count: number; title: string };
}

export const AchievementBadges = ({ userData }: AchievementBadgesProps) => {
  const [previousUnlocked, setPreviousUnlocked] = useState<string[]>([]);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);

  const getAchievements = (): Achievement[] => {
    const streakCount = userData.streaks.length;
    const completedTasks = Object.values(userData.todos).flat().filter(t => t.done).length;
    const completedChapters = userData.subs.reduce((acc, sub) => acc + sub.chapters.filter(ch => ch.done).length, 0);
    const focusSessions = userData.focusSessions.length;

    const achievements: Achievement[] = [];

    // Progressive streak achievements
    const streakMilestones = [10, 20, 30, 50, 100];
    for (let i = 0; i < streakMilestones.length; i++) {
      const milestone = streakMilestones[i];
      const nextMilestone = streakMilestones[i + 1];
      const isUnlocked = streakCount >= milestone;
      
      if (isUnlocked || (i === 0) || (streakCount >= streakMilestones[i - 1])) {
        achievements.push({
          id: `streak_${milestone}`,
          title: milestone === 10 ? "Getting Started" : 
                 milestone === 20 ? "Building Momentum" :
                 milestone === 30 ? "On Fire" :
                 milestone === 50 ? "Unstoppable" : "Legendary",
          description: `${milestone} day streak`,
          icon: <Flame className="w-6 h-6" />,
          unlocked: isUnlocked,
          progress: `${Math.min(streakCount, milestone)}/${milestone}`,
          nextTier: nextMilestone ? { count: nextMilestone, title: "Next goal" } : undefined
        });
      }
    }

    // Progressive task achievements
    const taskMilestones = [25, 50, 100, 200];
    for (let i = 0; i < taskMilestones.length; i++) {
      const milestone = taskMilestones[i];
      const nextMilestone = taskMilestones[i + 1];
      const isUnlocked = completedTasks >= milestone;
      
      if (isUnlocked || (i === 0) || (completedTasks >= taskMilestones[i - 1])) {
        achievements.push({
          id: `tasks_${milestone}`,
          title: milestone === 25 ? "Task Starter" :
                 milestone === 50 ? "Task Master" :
                 milestone === 100 ? "Task Expert" : "Task Legend",
          description: `Complete ${milestone} tasks`,
          icon: <Target className="w-6 h-6" />,
          unlocked: isUnlocked,
          progress: `${Math.min(completedTasks, milestone)}/${milestone}`,
          nextTier: nextMilestone ? { count: nextMilestone, title: "Next goal" } : undefined
        });
      }
    }

    // Progressive chapter achievements
    const chapterMilestones = [10, 20, 50, 100];
    for (let i = 0; i < chapterMilestones.length; i++) {
      const milestone = chapterMilestones[i];
      const nextMilestone = chapterMilestones[i + 1];
      const isUnlocked = completedChapters >= milestone;
      
      if (isUnlocked || (i === 0) || (completedChapters >= chapterMilestones[i - 1])) {
        achievements.push({
          id: `chapters_${milestone}`,
          title: milestone === 10 ? "Knowledge Beginner" :
                 milestone === 20 ? "Knowledge Seeker" :
                 milestone === 50 ? "Knowledge Expert" : "Knowledge Master",
          description: `Complete ${milestone} chapters`,
          icon: <BookOpen className="w-6 h-6" />,
          unlocked: isUnlocked,
          progress: `${Math.min(completedChapters, milestone)}/${milestone}`,
          nextTier: nextMilestone ? { count: nextMilestone, title: "Next goal" } : undefined
        });
      }
    }

    // Progressive focus achievements
    const focusMilestones = [5, 10, 25, 50];
    for (let i = 0; i < focusMilestones.length; i++) {
      const milestone = focusMilestones[i];
      const nextMilestone = focusMilestones[i + 1];
      const isUnlocked = focusSessions >= milestone;
      
      if (isUnlocked || (i === 0) || (focusSessions >= focusMilestones[i - 1])) {
        achievements.push({
          id: `focus_${milestone}`,
          title: milestone === 5 ? "Focus Beginner" :
                 milestone === 10 ? "Focus Champion" :
                 milestone === 25 ? "Focus Master" : "Focus Legend",
          description: `${milestone} focus sessions`,
          icon: <Clock className="w-6 h-6" />,
          unlocked: isUnlocked,
          progress: `${Math.min(focusSessions, milestone)}/${milestone}`,
          nextTier: nextMilestone ? { count: nextMilestone, title: "Next goal" } : undefined
        });
      }
    }

    return achievements;
  };

  const achievements = getAchievements();
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  useEffect(() => {
    const achievements = getAchievements();
    const currentUnlocked = achievements.filter(a => a.unlocked).map(a => a.id);
    
    // Check for newly unlocked achievements
    const newlyUnlocked = currentUnlocked.filter(id => !previousUnlocked.includes(id));
    
    if (newlyUnlocked.length > 0 && previousUnlocked.length > 0) {
      newlyUnlocked.forEach(id => {
        setCelebratingId(id);
        
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff6b35', '#f7931e', '#fdc830', '#f37335']
        });
        
        setTimeout(() => setCelebratingId(null), 3000);
      });
    }
    
    setPreviousUnlocked(currentUnlocked);
  }, [userData.streaks.length, userData.todos, userData.subs, userData.focusSessions.length]);

  return (
    <Card className="group p-6 shadow-card hover:shadow-elevated transition-all duration-300 border-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Achievements</h3>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1 font-bold">
          {unlockedCount}/{achievements.length}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`group/item relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 ${
              achievement.unlocked
                ? "bg-success/10 border-success shadow-md hover:shadow-glow hover:scale-105"
                : "bg-muted/30 border-border hover:border-primary/30 hover:bg-muted/50"
            } ${celebratingId === achievement.id ? "animate-celebration" : ""}`}
          >
            <div className={`transition-all duration-300 ${
              achievement.unlocked 
                ? "text-success group-hover/item:scale-110" 
                : "text-muted-foreground group-hover/item:text-primary"
            }`}>
              {achievement.icon}
            </div>
            <h4 className={`text-sm font-semibold mt-2 text-center transition-colors ${
              achievement.unlocked ? "text-foreground" : "text-muted-foreground group-hover/item:text-foreground"
            }`}>
              {achievement.title}
            </h4>
            <p className="text-xs text-muted-foreground text-center mt-1">
              {achievement.description}
            </p>
            {!achievement.unlocked && achievement.progress && (
              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-foreground">
                  {achievement.progress}
                </p>
                {achievement.nextTier && (
                  <p className="text-xs text-primary mt-1 font-medium">
                    Next: {achievement.nextTier.count}
                  </p>
                )}
              </div>
            )}
            {achievement.unlocked && (
              <Badge variant="outline" className="mt-2 text-xs bg-success/20 border-success font-semibold">
                Unlocked ✓
              </Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
