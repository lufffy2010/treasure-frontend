import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { UserData, Sub, Chapter } from "@/lib/storage";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { subjectNameSchema, chapterNameSchema } from "@/lib/validation";
import { toast } from "sonner";

interface SubsManagerProps {
  userData: UserData;
  onUpdate: (updates: Partial<UserData>) => void;
}

export const SubsManager = ({ userData, onUpdate }: SubsManagerProps) => {
  const [newSubName, setNewSubName] = useState("");
  const [newChapterNames, setNewChapterNames] = useState<Record<string, string>>({});
  const [openSubs, setOpenSubs] = useState<Record<string, boolean>>({});

  const addSub = () => {
    // Validate subject name
    const validationResult = subjectNameSchema.safeParse(newSubName);
    if (!validationResult.success) {
      toast.error(validationResult.error.issues[0]?.message ?? "Invalid subject name");
      return;
    }
    
    const newSub: Sub = {
      id: Date.now().toString(),
      name: validationResult.data,
      chapters: [],
    };
    
    onUpdate({ subs: [...userData.subs, newSub] });
    setNewSubName("");
  };

  const removeSub = (subId: string) => {
    onUpdate({ subs: userData.subs.filter(s => s.id !== subId) });
  };

  const addChapter = (subId: string) => {
    const chapterName = newChapterNames[subId];
    
    // Validate chapter name
    const validationResult = chapterNameSchema.safeParse(chapterName);
    if (!validationResult.success) {
      toast.error(validationResult.error.issues[0]?.message ?? "Invalid chapter name");
      return;
    }
    
    const newChapter: Chapter = {
      id: Date.now().toString(),
      name: validationResult.data,
      done: false,
    };
    
    const updatedSubs = userData.subs.map(sub =>
      sub.id === subId
        ? { ...sub, chapters: [...sub.chapters, newChapter] }
        : sub
    );
    
    onUpdate({ subs: updatedSubs });
    setNewChapterNames({ ...newChapterNames, [subId]: "" });
  };

  const toggleChapter = (subId: string, chapterId: string) => {
    const updatedSubs = userData.subs.map(sub =>
      sub.id === subId
        ? {
            ...sub,
            chapters: sub.chapters.map(ch =>
              ch.id === chapterId ? { ...ch, done: !ch.done } : ch
            ),
          }
        : sub
    );
    
    onUpdate({ subs: updatedSubs });
  };

  const removeChapter = (subId: string, chapterId: string) => {
    const updatedSubs = userData.subs.map(sub =>
      sub.id === subId
        ? { ...sub, chapters: sub.chapters.filter(ch => ch.id !== chapterId) }
        : sub
    );
    
    onUpdate({ subs: updatedSubs });
  };

  const getSubProgress = (sub: Sub) => {
    if (sub.chapters.length === 0) return 0;
    const completed = sub.chapters.filter(ch => ch.done).length;
    return Math.round((completed / sub.chapters.length) * 100);
  };

  const getChartData = () => {
    const data = userData.subs.map((sub, index) => {
      const progress = getSubProgress(sub);
      const colors = [
        "hsl(var(--primary))",
        "hsl(var(--secondary))",
        "hsl(var(--accent))",
        "hsl(210, 85%, 65%)",
        "hsl(280, 70%, 60%)",
        "hsl(340, 75%, 55%)",
      ];
      
      return {
        name: sub.name,
        value: progress,
        chapters: sub.chapters.length,
        completed: sub.chapters.filter(ch => ch.done).length,
        incomplete: sub.chapters.filter(ch => !ch.done).length,
        color: colors[index % colors.length],
      };
    });

    const totalChapters = userData.subs.reduce((acc, sub) => acc + sub.chapters.length, 0);
    const totalCompleted = userData.subs.reduce(
      (acc, sub) => acc + sub.chapters.filter(ch => ch.done).length,
      0
    );
    const totalIncomplete = totalChapters - totalCompleted;

    return { subjectData: data, totalIncomplete, totalChapters, totalCompleted };
  };

  const { subjectData, totalIncomplete, totalChapters, totalCompleted } = getChartData();

  return (
    <div className="space-y-6">
      {userData.subs.length === 0 ? (
        <Card className="p-12 shadow-card text-center">
          <p className="text-muted-foreground">
            No subjects yet — add your first subject below
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {userData.subs.map(sub => {
            const progress = getSubProgress(sub);
            const isOpen = openSubs[sub.id];

            return (
              <Card key={sub.id} className="p-6 shadow-card">
                <Collapsible
                  open={isOpen}
                  onOpenChange={(open) => setOpenSubs({ ...openSubs, [sub.id]: open })}
                >
                  <div className="flex items-center justify-between mb-4">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto hover:bg-transparent">
                        {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        <h3 className="text-xl font-semibold">{sub.name}</h3>
                      </Button>
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium text-muted-foreground">
                        {progress}% Complete
                      </div>
                      <Button onClick={() => removeSub(sub.id)} variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="w-full bg-muted rounded-full h-2 mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-success to-success/80 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <CollapsibleContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newChapterNames[sub.id] || ""}
                        onChange={(e) => setNewChapterNames({ ...newChapterNames, [sub.id]: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && addChapter(sub.id)}
                        placeholder="Chapter name..."
                        className="flex-1"
                      />
                      <Button onClick={() => addChapter(sub.id)} size="icon">
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {sub.chapters.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          No chapters yet — add your first chapter above
                        </p>
                      ) : (
                        sub.chapters.map(chapter => (
                          <div
                            key={chapter.id}
                            className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                          >
                            <Checkbox
                              checked={chapter.done}
                              onCheckedChange={() => toggleChapter(sub.id, chapter.id)}
                            />
                            <span className={`flex-1 ${chapter.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              {chapter.name}
                            </span>
                            <Button
                              onClick={() => removeChapter(sub.id, chapter.id)}
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      {userData.subs.length > 0 && (
        <Card className="p-8 shadow-elevated bg-gradient-to-br from-card via-card to-primary/5">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Subjects Progress Overview
            </h3>
            <p className="text-muted-foreground">Track your learning journey across all subjects</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl blur-xl" />
              <div className="relative bg-card/50 backdrop-blur-sm rounded-3xl p-6 border-2 border-primary/10 shadow-lg hover:shadow-xl transition-all">
                <h4 className="text-xl font-semibold mb-6 text-center flex items-center justify-center gap-2">
                  <span className="text-2xl">📚</span>
                  Subject Completion
                </h4>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <defs>
                      {subjectData.map((entry, index) => (
                        <linearGradient key={`gradient-${index}`} id={`colorGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                          <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={subjectData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={110}
                      innerRadius={45}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                      paddingAngle={2}
                    >
                      {subjectData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`url(#colorGradient-${index})`}
                          stroke="hsl(var(--background))"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-card/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border-2 border-primary/20">
                              <p className="font-bold text-lg mb-2 text-primary">{data.name}</p>
                              <div className="space-y-1 text-sm">
                                <p className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">Completion:</span>
                                  <span className="font-semibold text-success">{data.value}%</span>
                                </p>
                                <p className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">Completed:</span>
                                  <span className="font-semibold">{data.completed}/{data.chapters}</span>
                                </p>
                                <p className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">Remaining:</span>
                                  <span className="font-semibold text-destructive">{data.incomplete}</span>
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
                      height={36}
                      formatter={(value, entry: any) => (
                        <span className="text-sm font-medium">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-accent/5 rounded-3xl blur-xl" />
              <div className="relative bg-card/50 backdrop-blur-sm rounded-3xl p-6 border-2 border-success/10 shadow-lg hover:shadow-xl transition-all">
                <h4 className="text-xl font-semibold mb-6 text-center flex items-center justify-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Overall Progress
                </h4>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <defs>
                      <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="incompleteGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(145, 65%, 70%)" stopOpacity={0.7} />
                        <stop offset="100%" stopColor="hsl(145, 65%, 70%)" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={[
                        { name: "Completed", value: totalCompleted },
                        { name: "Remaining", value: totalIncomplete },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, value, percent }) => 
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={110}
                      innerRadius={45}
                      fill="hsl(var(--success))"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                      paddingAngle={3}
                    >
                      <Cell 
                        fill="url(#completedGradient)"
                        stroke="hsl(var(--background))"
                        strokeWidth={3}
                      />
                      <Cell 
                        fill="url(#incompleteGradient)"
                        stroke="hsl(var(--background))"
                        strokeWidth={3}
                      />
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          const percentage = ((data.value / totalChapters) * 100).toFixed(1);
                          return (
                            <div className="bg-card/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border-2 border-success/20">
                              <p className="font-bold text-lg mb-2 text-success">{data.name} Chapters</p>
                              <div className="space-y-1 text-sm">
                                <p className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">Count:</span>
                                  <span className="font-semibold">{data.value}/{totalChapters}</span>
                                </p>
                                <p className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">Percentage:</span>
                                  <span className="font-semibold text-primary">{percentage}%</span>
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="mt-4 p-4 bg-gradient-to-r from-success/10 to-accent/10 rounded-xl border border-success/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-foreground">Total Progress:</span>
                    <span className="text-lg font-bold text-success">
                      {totalChapters > 0 ? ((totalCompleted / totalChapters) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 shadow-card">
        <h3 className="text-xl font-semibold mb-4">Add New Subject</h3>
        <div className="flex gap-2">
          <Input
            value={newSubName}
            onChange={(e) => setNewSubName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSub()}
            placeholder="Subject name (e.g., Mathematics, Physics...)"
            className="flex-1"
          />
          <Button onClick={addSub}>
            <Plus className="w-5 h-5 mr-2" />
            Add Subject
          </Button>
        </div>
      </Card>
    </div>
  );
};
