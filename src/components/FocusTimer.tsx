import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserData, FocusSession } from "@/lib/storage";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FocusModeSettings } from "@/components/FocusModeSettings";
import { focusMinutesSchema } from "@/lib/validation";

interface FocusTimerProps {
  userData: UserData;
  onUpdate: (updates: Partial<UserData>) => void;
}

export const FocusTimer = ({ userData, onUpdate }: FocusTimerProps) => {
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(selectedDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStart, setSessionStart] = useState<string | null>(null);
  const [customMinutes, setCustomMinutes] = useState("");
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const presets = [25, 30, 45, 60];

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleComplete = () => {
    setIsRunning(false);
    
    if (sessionStart) {
      const session: FocusSession = {
        start: sessionStart,
        end: new Date().toISOString(),
        duration: selectedDuration,
      };
      
      onUpdate({ focusSessions: [...userData.focusSessions, session] });
      
      toast({
        title: "🎉 Focus Session Complete!",
        description: `Amazing work! You stayed focused for ${selectedDuration} minutes.`,
      });
    }
    
    setSessionStart(null);
  };

  const handleStart = () => {
    if (!isRunning && timeLeft === selectedDuration * 60) {
      setSessionStart(new Date().toISOString());
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedDuration * 60);
    setSessionStart(null);
  };

  const handlePresetChange = (duration: number) => {
    setSelectedDuration(duration);
    setTimeLeft(duration * 60);
    setIsRunning(false);
    setSessionStart(null);
    setCustomMinutes("");
  };

  const handleCustomTimeSet = () => {
    const minutes = parseInt(customMinutes);
    
    // Validate with zod schema
    const validationResult = focusMinutesSchema.safeParse(minutes);
    if (!validationResult.success) {
      toast({
        title: "Invalid time",
        description: validationResult.error.issues[0]?.message ?? "Please enter a valid number of minutes",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedDuration(validationResult.data);
    setTimeLeft(validationResult.data * 60);
    setIsRunning(false);
    setSessionStart(null);
    toast({
      title: "✓ Timer Set",
      description: `Ready to focus for ${validationResult.data} minutes`,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((selectedDuration * 60 - timeLeft) / (selectedDuration * 60)) * 100;

  const recentSessions = userData.focusSessions.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <FocusModeSettings />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-8 shadow-card hover:shadow-elevated transition-all duration-300 border-2">
        <div className="flex flex-col items-center space-y-8">
          <div className="bg-primary/10 p-4 rounded-full hover:bg-primary/20 transition-colors">
            <Timer className="w-12 h-12 text-primary" />
          </div>

          <div className="relative w-64 h-64">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="hsl(var(--secondary))"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                className="transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={isRunning ? handlePause : handleStart}
              size="lg"
              className="w-32"
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start
                </>
              )}
            </Button>
            <Button onClick={handleReset} size="lg" variant="outline" className="w-32">
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-md">
            <div className="flex gap-2">
              {presets.map(duration => (
                <Button
                  key={duration}
                  onClick={() => handlePresetChange(duration)}
                  variant={selectedDuration === duration ? "default" : "outline"}
                  size="sm"
                >
                  {duration}m
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Custom minutes"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCustomTimeSet()}
                min="1"
                max="240"
                className="flex-1"
              />
              <Button onClick={handleCustomTimeSet} variant="secondary" size="sm">
                Set
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-card hover:shadow-elevated transition-all duration-300 border-2">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-primary rounded-full"></div>
          Recent Sessions
        </h3>
        <div className="space-y-3">
          {recentSessions.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Timer className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground font-medium">
                No sessions yet
              </p>
              <p className="text-sm text-muted-foreground">
                Start your first focus session to build momentum!
              </p>
            </div>
          ) : (
            recentSessions.map((session, idx) => (
              <div
                key={idx}
                className="group flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-200 hover:shadow-md"
              >
                <div>
                  <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {session.duration} minutes
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(session.start).toLocaleDateString()} at{" "}
                    {new Date(session.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="text-primary font-bold text-xl group-hover:scale-110 transition-transform">✓</div>
              </div>
            ))
          )}
        </div>

        {userData.focusSessions.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {userData.focusSessions.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Sessions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">
                  {userData.focusSessions.reduce((acc, s) => acc + s.duration, 0)}m
                </div>
                <div className="text-sm text-muted-foreground">Total Time</div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
    </div>
  );
};
