import { useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, formatDateKeyIST } from "@/lib/storage";
import { getFocusModeBlockStatus } from "@/components/FocusModeSettings";

export interface NotificationPreferences {
  studyReminders: boolean;
  incompleteTasks: boolean;
  streakAlerts: boolean;
  dailySummary: boolean;
}

const PREFS_KEY = "notification_preferences";
const SUMMARY_SHOWN_KEY = "summary_shown_date";

export const getNotificationPreferences = (): NotificationPreferences => {
  const username = getCurrentUser();
  if (!username) return getDefaultPreferences();
  
  const stored = localStorage.getItem(`${PREFS_KEY}_${username}`);
  return stored ? JSON.parse(stored) : getDefaultPreferences();
};

export const saveNotificationPreferences = (prefs: NotificationPreferences): void => {
  const username = getCurrentUser();
  if (!username) return;
  localStorage.setItem(`${PREFS_KEY}_${username}`, JSON.stringify(prefs));
};

const getDefaultPreferences = (): NotificationPreferences => ({
  studyReminders: true,
  incompleteTasks: true,
  streakAlerts: true,
  dailySummary: true,
});

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    return false;
  }
  
  if (Notification.permission === "granted") {
    return true;
  }
  
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  
  return false;
};

export const sendBrowserNotification = (title: string, body: string, icon?: string) => {
  // Check if focus mode is blocking notifications
  if (getFocusModeBlockStatus()) {
    return; // Don't send notification if focus mode is active
  }
  
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: icon || "/favicon.ico",
      badge: "/favicon.ico",
    });
  }
};

export const useNotifications = () => {
  const { toast } = useToast();
  
  const showNotification = useCallback((title: string, description: string, type: "study" | "task" | "streak" | "summary") => {
    const prefs = getNotificationPreferences();
    
    // Check if focus mode is blocking notifications
    const isFocusModeActive = getFocusModeBlockStatus();
    
    let shouldShow = false;
    switch (type) {
      case "study":
        shouldShow = prefs.studyReminders;
        break;
      case "task":
        shouldShow = prefs.incompleteTasks;
        break;
      case "streak":
        shouldShow = prefs.streakAlerts;
        break;
      case "summary":
        shouldShow = prefs.dailySummary;
        break;
    }
    
    if (!shouldShow) return;
    
    // Show toast notification (skip if focus mode is active)
    if (!isFocusModeActive) {
      toast({ title, description });
    }
    
    // Show browser notification (skip if focus mode is active)
    if (!isFocusModeActive) {
      sendBrowserNotification(title, description);
    }
  }, [toast]);
  
  const checkDailySummaryTime = useCallback(() => {
    const now = new Date();
    const hour = now.getHours();
    const username = getCurrentUser();
    
    if (!username) return false;
    
    const today = formatDateKeyIST(now);
    const lastShown = localStorage.getItem(`${SUMMARY_SHOWN_KEY}_${username}`);
    
    // Show at 9 PM (21:00) and only once per day
    if (hour === 21 && lastShown !== today) {
      localStorage.setItem(`${SUMMARY_SHOWN_KEY}_${username}`, today);
      return true;
    }
    
    return false;
  }, []);
  
  const checkRandomIncompleteTaskNotification = useCallback(() => {
    const prefs = getNotificationPreferences();
    if (!prefs.incompleteTasks) return;
    
    const username = getCurrentUser();
    if (!username) return;

    // Check if notification was already sent today
    const today = formatDateKeyIST(new Date());
    const lastNotified = localStorage.getItem(`incomplete_task_notified_${username}`);
    
    if (lastNotified === today) return;

    // Random time between 10 AM and 8 PM (10-20 hours)
    const now = new Date();
    const hours = now.getHours();
    
    // Only check during active hours
    if (hours >= 10 && hours < 20) {
      // Random chance to trigger (higher probability as day progresses)
      const probability = (hours - 10) / 10; // Increases from 0 to 1
      if (Math.random() < probability * 0.1) { // 10% max chance per check
        showNotification(
          "Incomplete Tasks",
          "You have tasks waiting to be completed. Keep up the momentum!",
          "task"
        );
        localStorage.setItem(`incomplete_task_notified_${username}`, today);
      }
    }
  }, [showNotification]);
  
  const shouldShowSummaryNow = useCallback((): boolean => {
    const username = getCurrentUser();
    if (!username) return false;
    
    const today = formatDateKeyIST(new Date());
    const lastShown = localStorage.getItem(`${SUMMARY_SHOWN_KEY}_${username}`);
    
    return lastShown === today;
  }, []);
  
  useEffect(() => {
    // Check daily summary time and random incomplete task notification every minute
    const interval = setInterval(() => {
      if (checkDailySummaryTime()) {
        showNotification(
          "Today's Summary",
          "Check your progress, streaks, and achievements for today!",
          "summary"
        );
      }
      checkRandomIncompleteTaskNotification();
    }, 60000); // Check every minute

    // Initial checks
    if (checkDailySummaryTime()) {
      showNotification(
        "Today's Summary",
        "Check your progress, streaks, and achievements for today!",
        "summary"
      );
    }
    checkRandomIncompleteTaskNotification();

    return () => clearInterval(interval);
  }, [checkDailySummaryTime, checkRandomIncompleteTaskNotification, showNotification]);
  
  return {
    showNotification,
    checkDailySummaryTime,
    shouldShowSummaryNow,
  };
};
