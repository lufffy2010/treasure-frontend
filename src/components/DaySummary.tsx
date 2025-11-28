import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserData, formatDateKeyIST } from "@/lib/storage";
import { CheckCircle2, XCircle, Flame, BookOpen, Timer, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getRankByXP } from "@/lib/rankSystem";

interface DaySummaryProps {
  userData: UserData;
}

export const DaySummary = ({ userData }: DaySummaryProps) => {
  const today = formatDateKeyIST(new Date());
  const todayTodos = userData.todos[today] || [];
  const completedTodos = todayTodos.filter(t => t.done).length;
  const totalTodos = todayTodos.length;
  const completionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;
  
  const hasStreak = userData.streaks.includes(today);
  const currentRank = getRankByXP(userData.xp);
  const nextRank = getRankByXP(userData.xp + 1);
  const xpToNextRank = nextRank.xpRequired - userData.xp;
  
  const completedChaptersToday = userData.subs.reduce((acc, sub) => {
    return acc + sub.chapters.filter(ch => ch.done).length;
  }, 0);
  
  const todayFocusSessions = userData.focusSessions.filter(session => {
    const sessionDate = new Date(session.start).toISOString().split('T')[0];
    return sessionDate === today;
  });
  
  const totalFocusMinutes = todayFocusSessions.reduce((acc, session) => {
    return acc + Math.floor(session.duration / 60);
  }, 0);

  return (
    <Card className="w-full bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-foreground">
          Today's Summary
        </CardTitle>
        <p className="text-center text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tasks Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="font-semibold">Tasks Completed</span>
            </div>
            <span className="text-2xl font-bold text-primary">
              {completedTodos}/{totalTodos}
            </span>
          </div>
          <Progress value={completionRate} className="h-3" />
          <p className="text-sm text-muted-foreground text-center">
            {completionRate === 100 && totalTodos > 0 ? "🎉 Perfect day! All tasks done!" : 
             completionRate >= 75 ? "💪 Great progress!" :
             completionRate >= 50 ? "👍 Halfway there!" :
             completionRate > 0 ? "Keep going!" : 
             totalTodos === 0 ? "No tasks for today" : "Let's start!"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Flame className="w-5 h-5" />
                <span className="font-semibold">Streak</span>
              </div>
              <div className="text-2xl font-bold">
                {hasStreak ? (
                  <span className="text-primary">✅ Active</span>
                ) : (
                  <span className="text-muted-foreground">❌ Missed</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center gap-2 text-accent">
                <BookOpen className="w-5 h-5" />
                <span className="font-semibold">Chapters</span>
              </div>
              <div className="text-2xl font-bold text-accent">
                {completedChaptersToday}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/5 border-secondary/20">
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center gap-2 text-secondary-foreground">
                <Timer className="w-5 h-5" />
                <span className="font-semibold">Focus Time</span>
              </div>
              <div className="text-2xl font-bold">
                {totalFocusMinutes} min
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">Rank</span>
              </div>
              <div className="text-xl font-bold text-primary">
                {currentRank.icon} {currentRank.name}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* XP Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">XP Progress</span>
            <span className="font-semibold">{xpToNextRank} XP to next rank</span>
          </div>
          <Progress 
            value={((userData.xp - currentRank.xpRequired) / (nextRank.xpRequired - currentRank.xpRequired)) * 100} 
            className="h-2" 
          />
        </div>

        {/* Motivational Message */}
        <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
          <p className="font-semibold text-foreground">
            {completionRate === 100 && totalTodos > 0 ? "🌟 Incredible work today! You're unstoppable!" :
             completionRate >= 75 ? "🚀 You're crushing it! Keep the momentum!" :
             hasStreak ? "🔥 Your streak is alive! Don't break the chain!" :
             "💪 Tomorrow is a new opportunity. Stay focused!"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
