import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Crown, User } from "lucide-react";
import { getRankByXP } from "@/lib/rankSystem";
import { Skeleton } from "@/components/ui/skeleton";
import confetti from "canvas-confetti";
import { api } from "@/services/api";

interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  xp: number;
}

interface LeaderboardProps {
  currentUserId?: string;
}

export const Leaderboard = ({ currentUserId }: LeaderboardProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const celebratedRanks = useRef(new Set<string>());

  useEffect(() => {
    // try SSE real-time stream first
    let es: EventSource | null = null;

    if (typeof window !== 'undefined' && 'EventSource' in window) {
      try {
        es = new EventSource(api.getLeaderboardStreamUrl(currentUserId));
        es.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            setProfiles(data.leaderboard || []);
            if (data.rank) {
              setCurrentUserRank(data.rank);
              if (data.rank <= 10 && currentUserId && !celebratedRanks.current.has(currentUserId)) {
                celebratedRanks.current.add(currentUserId);
                setTimeout(() => {
                  const rank = data.rank;
                  const colors = rank === 1 ? ['#FFD700', '#FDB931'] :
                    rank === 2 ? ['#C0C0C0', '#E8E8E8'] :
                      rank === 3 ? ['#CD7F32', '#E59849'] :
                        rank <= 5 ? ['#3B82F6', '#60A5FA'] :
                          ['#10B981', '#34D399'];
                  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors });
                }, 500);
              }
            }
            setLoading(false);
          } catch (err) {
            console.error('Error parsing leaderboard SSE message', err);
          }
        };
        es.onerror = (err) => {
          console.warn('Leaderboard SSE error, falling back to fetch', err);
          try { es?.close(); } catch (e) { }
          es = null;
          fetchLeaderboard();
        };
      } catch (err) {
        fetchLeaderboard();
      }
    } else {
      fetchLeaderboard();
    }

    return () => {
      if (es) {
        try { es.close(); } catch (e) { }
      }
    };
  }, [currentUserId]);

  const fetchLeaderboard = async () => {
    try {
      const data = await api.getLeaderboard(currentUserId);
      setProfiles(data.leaderboard || []);
      if (data.rank) {
        setCurrentUserRank(data.rank);

        if (data.rank <= 10 && currentUserId && !celebratedRanks.current.has(currentUserId)) {
          celebratedRanks.current.add(currentUserId);
          setTimeout(() => {
            const rank = data.rank;
            const colors = rank === 1 ? ['#FFD700', '#FDB931'] :
              rank === 2 ? ['#C0C0C0', '#E8E8E8'] :
                rank === 3 ? ['#CD7F32', '#E59849'] :
                  rank <= 5 ? ['#3B82F6', '#60A5FA'] :
                    ['#10B981', '#34D399'];

            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors });
          }, 500);
        }
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-amber-400 animate-crown-glow" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-orange-600" />;
    return <Trophy className="w-4 h-4 text-muted-foreground" />;
  };

  const getLegacyBadge = (index: number) => {
    if (index === 0) return { text: "Legend", color: "bg-amber-500 text-white" };
    if (index === 1) return { text: "Master", color: "bg-gray-400 text-white" };
    if (index === 2) return { text: "Elite", color: "bg-orange-600 text-white" };
    if (index < 5) return { text: "Veteran", color: "bg-blue-500 text-white" };
    if (index < 10) return { text: "Rising", color: "bg-green-500 text-white" };
    return null;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Leaderboard</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-pulse" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">⚔️ Leaderboard</h2>
        </div>
        {currentUserRank && (
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 sm:py-2 rounded-full border border-primary/30 shadow-md">
            <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm font-bold text-primary">
              Your Rank: #{currentUserRank}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2 sm:space-y-3">
        {profiles.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-muted-foreground">
            <Trophy className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm sm:text-base">No captains on the seas yet. Be the first!</p>
          </div>
        ) : (
          profiles.map((profile, index) => {
            const rank = getRankByXP(profile.xp);
            const isCurrentUser = profile.id === currentUserId;
            const legacyBadge = getLegacyBadge(index);

            return (
              <div
                key={profile.id}
                className={`flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 rounded-xl transition-all duration-300 ${isCurrentUser
                  ? "bg-primary/20 ring-2 ring-primary shadow-lg scale-105 hover:scale-110"
                  : index < 3
                    ? "bg-accent/10 hover:bg-accent/15 hover:scale-105"
                    : "bg-muted/50 hover:bg-muted hover:scale-102"
                  } ${index === 0 ? 'ring-2 ring-amber-400/50' : index === 1 ? 'ring-2 ring-gray-400/50' : index === 2 ? 'ring-2 ring-orange-600/50' : ''}`}
              >
                <div className="flex items-center justify-center w-5 sm:w-6 md:w-8 shrink-0">
                  {getRankIcon(index)}
                </div>

                <div className="text-xl sm:text-2xl md:text-3xl shrink-0">{profile.avatar_url}</div>

                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <h3 className="font-bold text-xs sm:text-sm md:text-base text-foreground truncate">
                      {profile.username}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {legacyBadge && (
                        <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-semibold shrink-0 animate-scale-in ${legacyBadge.color} ${index === 0 ? 'animate-pulse shadow-lg shadow-amber-500/50' :
                          index === 1 ? 'animate-pulse shadow-lg shadow-gray-400/50' :
                            index === 2 ? 'animate-pulse shadow-lg shadow-orange-600/50' : ''
                          }`}>
                          {legacyBadge.text}
                        </span>
                      )}
                      {isCurrentUser && (
                        <span className="text-[10px] sm:text-xs bg-primary text-primary-foreground px-1.5 sm:px-2 py-0.5 rounded-full font-semibold shrink-0">
                          YOU
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate mt-0.5">{rank.icon} {rank.name}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm sm:text-lg md:text-2xl font-bold text-primary">
                    {profile.xp.toLocaleString()}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">XP</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};