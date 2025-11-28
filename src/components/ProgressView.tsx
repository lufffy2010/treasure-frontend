import React from "react";
import { Card } from "@/components/ui/card";
import { UserData } from "@/lib/storage";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface ProgressViewProps {
  userData: UserData;
}

export const ProgressView = ({ userData }: ProgressViewProps) => {
  const getSubsProgress = () => {
    return userData.subs.map(sub => {
      const total = sub.chapters.length;
      const completed = sub.chapters.filter(ch => ch.done).length;
      return {
        name: sub.name,
        value: total > 0 ? Math.round((completed / total) * 100) : 0,
        completed,
        total,
      };
    });
  };

  const getStreakStats = () => {
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const streakDates = userData.streaks.map(s => new Date(s));

    const thisWeekCount = streakDates.filter(d => d >= thisWeekStart && d <= now).length;
    const lastWeekCount = streakDates.filter(d => d >= lastWeekStart && d < thisWeekStart).length;
    const thisMonthCount = streakDates.filter(d => d >= thisMonthStart && d <= now).length;
    const lastMonthCount = streakDates.filter(d => d >= lastMonthStart && d <= lastMonthEnd).length;

    return [
      { period: "This Week", count: thisWeekCount },
      { period: "Last Week", count: lastWeekCount },
      { period: "This Month", count: thisMonthCount },
      { period: "Last Month", count: lastMonthCount },
    ];
  };

  const subsProgress = getSubsProgress();
  const streakStats = getStreakStats();

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--success))', 'hsl(var(--accent))', 'hsl(var(--destructive))'];

  const overallProgress = subsProgress.reduce((acc, sub) => {
    return acc + sub.completed;
  }, 0);

  const totalChapters = subsProgress.reduce((acc, sub) => acc + sub.total, 0);
  const overallPercentage = totalChapters > 0 ? Math.round((overallProgress / totalChapters) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 shadow-card">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">{userData.streaks.length}</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Total Streaks</div>
          </div>
        </Card>
        <Card className="p-6 shadow-card">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-success mb-2">{overallPercentage}%</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Overall Progress</div>
          </div>
        </Card>
        <Card className="p-6 shadow-card">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-secondary mb-2">{userData.focusSessions.length}</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Focus Sessions</div>
          </div>
        </Card>
      </div>

      {subsProgress.length > 0 && (
        <Card className="p-8 shadow-elevated bg-gradient-to-br from-card via-card to-primary/5 border-2 border-primary/10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl blur-2xl" />
            <div className="relative">
              <h3 className="text-2xl sm:text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                📚 Syllabus Completion by Subject
              </h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {subsProgress.map((_, index) => (
                        <React.Fragment key={`gradient-${index}`}>
                          <linearGradient id={`colorGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1} />
                            <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.6} />
                          </linearGradient>
                          <filter id={`shadow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                            <feOffset dx="0" dy="4" result="offsetblur" />
                            <feComponentTransfer>
                              <feFuncA type="linear" slope="0.3" />
                            </feComponentTransfer>
                            <feMerge>
                              <feMergeNode />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </React.Fragment>
                      ))}
                    </defs>
                    <Pie
                      data={subsProgress}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={130}
                      innerRadius={60}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1000}
                      animationEasing="ease-out"
                      paddingAngle={3}
                    >
                      {subsProgress.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={`url(#colorGradient-${index})`}
                          stroke="hsl(var(--background))"
                          strokeWidth={3}
                          filter={`url(#shadow-${index})`}
                          className="transition-all duration-300 hover:opacity-80"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-card/95 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border-2 border-primary/30 animate-in fade-in zoom-in duration-200">
                              <p className="font-bold text-xl mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                {data.name}
                              </p>
                              <div className="space-y-2 text-sm">
                                <p className="flex justify-between gap-6">
                                  <span className="text-muted-foreground font-medium">Completion:</span>
                                  <span className="font-bold text-success text-lg">{data.value}%</span>
                                </p>
                                <p className="flex justify-between gap-6">
                                  <span className="text-muted-foreground font-medium">Progress:</span>
                                  <span className="font-semibold text-foreground">{data.completed}/{data.total}</span>
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={40}
                      iconType="circle"
                      formatter={(value) => (
                        <span className="text-sm font-semibold text-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-8 shadow-elevated bg-gradient-to-br from-card via-card to-success/5 border-2 border-success/10">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-primary/5 rounded-3xl blur-2xl" />
          <div className="relative">
            <h3 className="text-2xl sm:text-3xl font-bold mb-8 text-center bg-gradient-to-r from-success via-primary to-secondary bg-clip-text text-transparent">
              📊 Streak Comparison
            </h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={streakStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={1} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    </linearGradient>
                    <filter id="barShadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                      <feOffset dx="0" dy="4" result="offsetblur" />
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.4" />
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="5 5" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="period" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 600 }}
                    axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 2 }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 600 }}
                    axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 2 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card/95 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border-2 border-success/30 animate-in fade-in zoom-in duration-200">
                            <p className="font-bold text-lg mb-2 text-success">{payload[0].payload.period}</p>
                            <p className="flex justify-between gap-6">
                              <span className="text-muted-foreground font-medium">Study Days:</span>
                              <span className="font-bold text-foreground text-xl">{payload[0].value}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="url(#barGradient)"
                    radius={[12, 12, 0, 0]}
                    filter="url(#barShadow)"
                    animationBegin={0}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
