import { Home, BookOpen, TrendingUp, Timer, Info, Mail, Bell, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserData } from "@/lib/storage";
import { useEffect, useState } from "react";
import { NotificationSettings } from "./NotificationSettings";
import { DaySummary } from "./DaySummary";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AchievementDialog } from "./AchievementDialog";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: "dashboard" | "subs" | "progress" | "focus" | "leaderboard") => void;
  userData: UserData;
}

export const Sidebar = ({ activeView, onViewChange, userData }: SidebarProps) => {
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const data = await api.getCurrentUser(token || undefined);
      setProfile(data.user);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  useEffect(() => {
    if (userData?.badges) {
      setUnlockedCount(userData.badges.length);
    }
  }, [userData]);

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "subs", icon: BookOpen, label: "Subjects" },
    { id: "progress", icon: TrendingUp, label: "Progress" },
    { id: "focus", icon: Timer, label: "Focus" },
    { id: "leaderboard", icon: Users, label: "⚔️ Leaderboard" },
  ] as const;

  return (
    <aside className="h-screen w-64 bg-card border-r border-border flex flex-col py-4 px-3 shadow-xl">
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {navItems.map(({ id, icon: Icon, label }) => (
          <Button
            key={id}
            onClick={() => onViewChange(id as any)}
            variant={activeView === id ? "default" : "ghost"}
            className="w-full justify-start gap-3 h-12"
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-2 pt-3 border-t border-border">
        <Dialog open={showSummary} onOpenChange={setShowSummary}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12"
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">Daily Summary</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DaySummary userData={userData} />
          </DialogContent>
        </Dialog>

        <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12"
            >
              <Bell className="w-5 h-5" />
              <span className="font-medium">Notifications</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <NotificationSettings />
          </DialogContent>
        </Dialog>

        <AchievementDialog unlockedCount={unlockedCount} userData={userData} />

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12"
            >
              <Info className="w-5 h-5" />
              <span className="font-medium">About Us</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold">About Us — Monkey D. Luffy</DialogTitle>
              <div className="text-xs sm:text-sm md:text-base leading-relaxed space-y-2 sm:space-y-3 md:space-y-4 pt-3 sm:pt-4 text-muted-foreground">
                <p>
                  Welcome to StudyTracker, a place built with one simple dream —
                  to help every student stay consistent, stay motivated, and chase greatness.
                </p>
                <p>
                  Under the code name <span className="font-semibold">Monkey D. Luffy</span>, this platform was created with the belief that anyone can rise above distractions, defeat procrastination, and build powerful habits that shape a better future.
                </p>
                <p>
                  Just like a pirate captain who never abandons his goal, StudyTracker is designed to help you:
                </p>
                <ul className="space-y-1.5 sm:space-y-2 pl-3 sm:pl-4">
                  <li>⭐ Track your daily streaks</li>
                  <li>🧭 Stay organized with subjects and tasks</li>
                  <li>🔥 Stay motivated with fresh daily quotes</li>
                  <li>⏰ Build discipline through focus sessions</li>
                  <li>📅 Review your journey, day by day</li>
                </ul>
                <p className="font-medium">
                  This website is not just a tracker —<br />
                  It's a reminder that every small step matters, and every single day adds to your legacy.
                </p>
                <p className="text-base sm:text-lg font-semibold text-primary">
                  Your journey is your treasure.<br />
                  Stay consistent. Stay unstoppable.
                </p>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12"
            >
              <Mail className="w-5 h-5" />
              <span className="font-medium">Send Feedback</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-md bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/20 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-center bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Send Feedback — Reach the Captain Directly!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm md:text-base text-muted-foreground">
              <p>
                If you spot any bugs, have ideas, or want to share your journey, you can send your feedback directly to our captain's inbox:
              </p>
              <div className="text-center">
                <Button
                  variant="default"
                  size="lg"
                  className="gap-1.5 sm:gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-xs sm:text-sm md:text-base h-9 sm:h-10 md:h-11"
                  asChild
                >
                  <a href="mailto:studytrackerr@gmail.com?subject=StudyTracker Feedback">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">studytrackerr@gmail.com</span>
                    <span className="sm:hidden">Email</span>
                  </a>
                </Button>
              </div>
              <p className="text-center text-xs italic text-primary">
                Your voice helps us sail forward! ⚔️
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  );
};