import { BackendUser } from "@/types/User";
import { useState, useEffect } from "react";
import { formatDateKeyIST, UserData } from "@/lib/storage";
import { QuoteCard } from "./QuoteCard";
import { StreakCard } from "./StreakCard";
import { CalendarView } from "./CalendarView";
import { DayPanel } from "./DayPanel";
import { AchievementBadges } from "./AchievementBadges";
import { Sidebar } from "./Sidebar";
import { SubsManager } from "./SubsManager";
import { ProgressView } from "./ProgressView";
import { FocusTimer } from "./FocusTimer";
import { ProfileMenu } from "./ProfileMenu";
import { ThemeSelector } from "./ThemeSelector";
import { NotificationCenter } from "./NotificationCenter";
import { Leaderboard } from "./Leaderboard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Send, Menu, X } from "lucide-react";
import { calculateXPFromStreaks, calculateXPFromTasks, calculateXPFromChapters, calculateXPFromFocus, getRankByXP } from "@/lib/rankSystem";
import { checkAndAwardBadges, getBadgeById } from "@/lib/badgeSystem";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import confetti from "canvas-confetti";
import { api } from "@/services/api";

export const Dashboard = () => {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState<"dashboard" | "subs" | "progress" | "focus" | "leaderboard">("dashboard");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showFirstTimeHint, setShowFirstTimeHint] = useState(false);
  const [historyStatePushed, setHistoryStatePushed] = useState(false);



  // Pull to refresh states
  const [pullStartY, setPullStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshThreshold = 80;

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Handle mobile back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Close any open UI elements when back button is pressed
      if (isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
        event.preventDefault();
      } else if (selectedDate) {
        setSelectedDate(null);
        event.preventDefault();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isMobileSidebarOpen, selectedDate]);

  // Push history state when opening UI elements
  useEffect(() => {
    if (isMobileSidebarOpen || selectedDate) {
      if (!historyStatePushed) {
        window.history.pushState({ uiOpen: true }, '', window.location.pathname);
        setHistoryStatePushed(true);
      }
    } else {
      setHistoryStatePushed(false);
    }
  }, [isMobileSidebarOpen, selectedDate, historyStatePushed]);

  // Pull to refresh handlers
  const handlePullStart = (clientY: number) => {
    if (window.scrollY === 0 && !isRefreshing) {
      setPullStartY(clientY);
    }
  };

  const handlePullMove = (clientY: number) => {
    if (pullStartY > 0 && window.scrollY === 0) {
      const distance = clientY - pullStartY;
      if (distance > 0) {
        setPullDistance(Math.min(distance, refreshThreshold * 1.5));
      }
    }
  };

  const handlePullEnd = async () => {
    if (pullDistance >= refreshThreshold) {
      setIsRefreshing(true);
      await loadUserData();
      toast({
        title: "🌊 Data Refreshed",
        description: "Your StudyTracker is up to date",
      });
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
        setPullStartY(0);
      }, 500);
    } else {
      setPullDistance(0);
      setPullStartY(0);
    }
  };

  // Touch handlers for pull to refresh
  const onTouchStartRefresh = (e: React.TouchEvent) => {
    handlePullStart(e.touches[0].clientY);
  };

  const onTouchMoveRefresh = (e: React.TouchEvent) => {
    handlePullMove(e.touches[0].clientY);
  };

  const onTouchEndRefresh = () => {
    handlePullEnd();
  };

  const loadUserData = () => {
    if (!user) return;
    const userId = (user as any)?._id ?? (user as any)?.id;

    // Get user data from localStorage with user id as key
    const storedData = localStorage.getItem(`userData_${userId}`);
    if (storedData) {
      const data = JSON.parse(storedData);
      setUserData(data);
    } else {
      // Initialize new user data
      const newData: UserData = {
        quotesSeen: [],
        todos: {},
        streaks: [],
        subs: [],
        focusSessions: [],
        autoStreakOnComplete: false,
        rank: 1,
        xp: 0,
        badges: [],
      };
      const userId = (user as any)?._id ?? (user as any)?.id;
      localStorage.setItem(`userData_${userId}`, JSON.stringify(newData));
      setUserData(newData);
    }
  };

  const refreshUserData = () => {
    loadUserData();
  };

  // Trigger sync on load if user data exists
  useEffect(() => {
    if (user && userData) {
      // Small delay to ensure everything is loaded
      const timer = setTimeout(() => {
        updateUserData({});
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const updateUserData = async (updates: Partial<UserData>) => {
    if (!user || !userData) return;

    const newData = { ...userData, ...updates };

    // Calculate XP from all sources
    const streakXP = calculateXPFromStreaks(newData.streaks.length);
    const completedTasks = Object.values(newData.todos).flat().filter(t => t.done).length;
    const taskXP = calculateXPFromTasks(completedTasks);
    const completedChapters = newData.subs.reduce((acc, sub) => acc + sub.chapters.filter(ch => ch.done).length, 0);
    const chapterXP = calculateXPFromChapters(completedChapters);
    const focusXP = calculateXPFromFocus(newData.focusSessions.length);

    const totalXP = streakXP + taskXP + chapterXP + focusXP;
    const currentRank = getRankByXP(totalXP);
    const previousRank = getRankByXP(userData.xp);

    newData.xp = totalXP;
    newData.rank = currentRank.level;

    // Check for rank up
    if (currentRank.level > previousRank.level) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']
      });
      toast({
        title: "🎉 Rank Up!",
        description: `You've reached ${currentRank.icon} ${currentRank.name}!`,
      });
    }

    // Check and award badges
    const newlyUnlockedBadges = checkAndAwardBadges(newData);
    if (newlyUnlockedBadges.length > 0) {
      const updatedBadges = [...(newData.badges || [])];
      newlyUnlockedBadges.forEach(badgeId => {
        const badgeDef = getBadgeById(badgeId);
        if (badgeDef) {
          updatedBadges.push({
            id: badgeId,
            name: badgeDef.name,
            category: badgeDef.category,
            unlocked: true,
            unlockedAt: new Date().toISOString(),
          });

          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#fbbf24', '#f59e0b', '#dc2626', '#7c3aed']
          });

          toast({
            title: `🏅 Badge Unlocked!`,
            description: `${badgeDef.icon} ${badgeDef.name}`,
          });
        }
      });
      newData.badges = updatedBadges;
    }

    // Save to localStorage
    localStorage.setItem(`userData_${(user as BackendUser)._id}`, JSON.stringify(newData));
    setUserData(newData);

    // Sync XP to database
    try {
      if (newData.xp !== undefined) {
        await api.updateXP(newData.xp);
      }
    } catch (error) {
      console.error('Failed to sync XP to database:', error);
    }
  };



  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowFirstTimeHint(true);
  };

  const handleCloseDayPanel = () => {
    setSelectedDate(null);
  };

  const handleToggleStreak = (date: Date) => {
    if (!userData) return;
    const dateKey = formatDateKeyIST(date);
    const streaks = [...userData.streaks];
    const index = streaks.indexOf(dateKey);

    if (index > -1) {
      streaks.splice(index, 1);
    } else {
      streaks.push(dateKey);
    }

    updateUserData({ streaks });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin text-4xl">🌊</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <div className="animate-spin text-4xl">🌊</div>
        <p className="text-muted-foreground">Loading your journey...</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reload
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen w-full bg-background relative"
      onTouchStart={onTouchStartRefresh}
      onTouchMove={onTouchMoveRefresh}
      onTouchEnd={onTouchEndRefresh}
    >
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="fixed top-0 left-0 right-0 flex justify-center items-center z-50 transition-opacity"
          style={{
            height: `${pullDistance}px`,
            opacity: Math.min(pullDistance / refreshThreshold, 1)
          }}
        >
          <div className="bg-primary/10 backdrop-blur-sm rounded-full p-3">
            <div
              className={`text-primary ${isRefreshing ? 'animate-spin' : ''}`}
              style={{
                transform: `rotate(${pullDistance * 2}deg)`
              }}
            >
              🌊
            </div>
          </div>
        </div>
      )}

      <NotificationCenter userData={userData} />

      {/* Simplified sidebar - hidden by default, shows only on hamburger click */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        style={{ willChange: 'transform' }}
      >
        <Sidebar activeView={activeView} onViewChange={(view) => {
          setActiveView(view);
          setIsMobileSidebarOpen(false);
        }} userData={userData} />
      </div>

      {/* Backdrop overlay when sidebar is open */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <main
        className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden"
        onClick={() => isMobileSidebarOpen && setIsMobileSidebarOpen(false)}
      >
        <div className="max-w-7xl mx-auto">
          {/* Helpful calendar hint popup */}
          {showFirstTimeHint && selectedDate && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-scale-in">
              <div className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground px-6 py-4 rounded-2xl shadow-elevated flex items-center gap-3 max-w-sm mx-4 border-2 border-primary-foreground/20">
                <span className="text-4xl animate-bounce">👇</span>
                <p className="text-sm font-bold leading-tight">Scroll down to add tasks, todos, and track your progress for this day!</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Hamburger menu button - WORKING */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 hover:bg-primary/10 active:bg-primary/20 transition-all shrink-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMobileSidebarOpen(!isMobileSidebarOpen);
                }}
                aria-label="Toggle menu"
              >
                {isMobileSidebarOpen ? (
                  <X className="w-6 h-6 text-primary" />
                ) : (
                  <Menu className="w-6 h-6 text-foreground" />
                )}
              </Button>

              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                {activeView === "dashboard" && "Dashboard"}
                {activeView === "subs" && "Subjects"}
                {activeView === "progress" && "Progress"}
                {activeView === "focus" && "Focus"}
                {activeView === "leaderboard" && "Leaderboard"}
              </h1>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 w-full sm:w-auto justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-3 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Telegram</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-lg bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/20 rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-foreground">
                      Telegram Feature: Temporarily Unavailable
                    </DialogTitle>
                  </DialogHeader>
                  <DialogDescription className="space-y-3 sm:space-y-4 text-xs sm:text-sm md:text-base text-muted-foreground">
                    <p className="text-center font-medium text-foreground">
                      Ahoy, traveler!
                    </p>
                    <p className="text-foreground">
                      Our Telegram feature has drifted off course somewhere in the Grand Line. The seas are rough, the currents are wild, and our crew is working hard to bring it back to shore.
                    </p>
                    <p className="font-semibold text-foreground text-xs sm:text-sm">
                      For now, this feature is unavailable — but fear not!<br />
                      We'll repair the ship, adjust the sails, and return stronger than ever.
                    </p>
                    <p className="text-center italic text-primary text-xs sm:text-sm">
                      Thanks for sailing with us. Your patience keeps our journey alive.
                    </p>
                  </DialogDescription>
                </DialogContent>
              </Dialog>
              <ThemeSelector />
              <ProfileMenu onUpdate={refreshUserData} />
            </div>
          </div>

          {activeView === "dashboard" && (
            <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-fade-in">
              <QuoteCard userData={userData} onUpdate={updateUserData} />

              <StreakCard
                streaks={userData.streaks}
                onToggleStreak={handleToggleStreak}
              />

              <AchievementBadges userData={userData} />

              <CalendarView
                userData={userData}
                onDateClick={handleDateClick}
                selectedDate={selectedDate}
              />

              <DayPanel
                date={selectedDate}
                userData={userData}
                onUpdate={updateUserData}
                onClose={handleCloseDayPanel}
                onToggleStreak={handleToggleStreak}
                open={selectedDate !== null}
              />
            </div>
          )}

          {activeView === "subs" && (
            <div className="animate-fade-in">
              <SubsManager userData={userData} onUpdate={updateUserData} />
            </div>
          )}

          {activeView === "progress" && (
            <div className="animate-fade-in">
              <ProgressView userData={userData} />
            </div>
          )}

          {activeView === "focus" && (
            <div className="animate-fade-in">
              <FocusTimer userData={userData} onUpdate={updateUserData} />
            </div>
          )}

          {activeView === "leaderboard" && (
            <div className="animate-fade-in">
              <Leaderboard currentUserId={(user as any)?._id ?? (user as any)?.id} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
