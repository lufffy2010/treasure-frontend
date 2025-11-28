import { useEffect, useState } from "react";
import { UserData, formatDateKeyIST } from "@/lib/storage";
import { useNotifications, getNotificationPreferences } from "@/hooks/useNotifications";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DaySummary } from "./DaySummary";

interface NotificationCenterProps {
  userData: UserData;
  onTaskComplete?: () => void;
}

export const NotificationCenter = ({ userData, onTaskComplete }: NotificationCenterProps) => {
  const { showNotification, checkDailySummaryTime, shouldShowSummaryNow } = useNotifications();
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [lastTaskCount, setLastTaskCount] = useState(0);

  // Check for daily summary at 9 PM
  useEffect(() => {
    const checkSummary = () => {
      if (checkDailySummaryTime()) {
        const prefs = getNotificationPreferences();
        if (prefs.dailySummary) {
          setShowSummaryDialog(true);
          showNotification(
            "📊 Daily Summary Ready",
            "Check out your progress for today!",
            "summary"
          );
        }
      }
    };

    // Check immediately and then every minute
    checkSummary();
    const interval = setInterval(checkSummary, 60000);
    return () => clearInterval(interval);
  }, [checkDailySummaryTime, showNotification]);

  // Check for incomplete tasks at end of day (9 PM)
  useEffect(() => {
    const checkIncompleteTasks = () => {
      const now = new Date();
      if (now.getHours() === 21) {
        const today = formatDateKeyIST(now);
        const todayTodos = userData.todos[today] || [];
        const incomplete = todayTodos.filter(t => !t.done).length;
        
        if (incomplete > 0) {
          showNotification(
            "📋 Tasks Remaining",
            `You have ${incomplete} incomplete task${incomplete > 1 ? 's' : ''} today`,
            "task"
          );
        }
      }
    };

    const interval = setInterval(checkIncompleteTasks, 60000);
    return () => clearInterval(interval);
  }, [userData.todos, showNotification]);

  // Activity-based study reminders
  useEffect(() => {
    const today = formatDateKeyIST(new Date());
    const todayTodos = userData.todos[today] || [];
    const completedCount = todayTodos.filter(t => t.done).length;

    // Only show if task count increased (new completion)
    if (completedCount > lastTaskCount && lastTaskCount > 0) {
      const remaining = todayTodos.length - completedCount;
      
      if (remaining > 0) {
        showNotification(
          "🎯 Keep Going!",
          `Great job! ${remaining} task${remaining > 1 ? 's' : ''} remaining`,
          "study"
        );
      } else if (completedCount > 0) {
        showNotification(
          "🎉 All Tasks Complete!",
          "You've finished all your tasks for today!",
          "study"
        );
      }
    }
    
    setLastTaskCount(completedCount);
  }, [userData.todos, lastTaskCount, showNotification]);

  // Streak milestone celebrations
  useEffect(() => {
    const streakCount = userData.streaks.length;
    const milestones = [7, 14, 30, 50, 100, 200, 365];
    
    if (milestones.includes(streakCount)) {
      showNotification(
        "🔥 Streak Milestone!",
        `${streakCount} day streak! You're on fire!`,
        "streak"
      );
    }
  }, [userData.streaks.length, showNotification]);

  return (
    <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DaySummary userData={userData} />
      </DialogContent>
    </Dialog>
  );
};
