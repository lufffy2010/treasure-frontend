import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { getNotificationPreferences, saveNotificationPreferences, requestNotificationPermission, NotificationPreferences } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";

export const NotificationSettings = () => {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<NotificationPreferences>(getNotificationPreferences());
  const [browserPermission, setBrowserPermission] = useState(Notification.permission);

  useEffect(() => {
    setPrefs(getNotificationPreferences());
  }, []);

  const handleToggle = (key: keyof NotificationPreferences) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    saveNotificationPreferences(newPrefs);
    
    toast({
      title: "Settings Updated",
      description: `${key} notifications ${newPrefs[key] ? "enabled" : "disabled"}`,
    });
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setBrowserPermission(Notification.permission);
    
    if (granted) {
      toast({
        title: "✅ Notifications Enabled",
        description: "You'll now receive browser notifications",
      });
    } else {
      toast({
        title: "❌ Permission Denied",
        description: "Please enable notifications in your browser settings",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Manage your study reminders and alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {browserPermission !== "granted" && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="text-sm text-muted-foreground">
              Enable browser notifications to receive alerts even when you're not viewing the app
            </p>
            <Button onClick={handleRequestPermission} variant="outline" size="sm" className="w-full">
              <Bell className="w-4 h-4 mr-2" />
              Enable Browser Notifications
            </Button>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="studyReminders" className="font-medium">
                Study Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you complete tasks and make progress
              </p>
            </div>
            <Switch
              id="studyReminders"
              checked={prefs.studyReminders}
              onCheckedChange={() => handleToggle("studyReminders")}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="incompleteTasks" className="font-medium">
                Task Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Random reminder during the day (10 AM - 8 PM) about pending tasks
              </p>
            </div>
            <Switch
              id="incompleteTasks"
              checked={prefs.incompleteTasks}
              onCheckedChange={() => handleToggle("incompleteTasks")}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="streakAlerts" className="font-medium">
                Streak Milestones
              </Label>
              <p className="text-sm text-muted-foreground">
                Celebrate when you reach streak milestones
              </p>
            </div>
            <Switch
              id="streakAlerts"
              checked={prefs.streakAlerts}
              onCheckedChange={() => handleToggle("streakAlerts")}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="dailySummary" className="font-medium">
                Daily Summary
              </Label>
              <p className="text-sm text-muted-foreground">
                Get a summary of your day at 9 PM
              </p>
            </div>
            <Switch
              id="dailySummary"
              checked={prefs.dailySummary}
              onCheckedChange={() => handleToggle("dailySummary")}
            />
          </div>
        </div>

        {browserPermission === "granted" && (
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <p className="text-sm text-primary">Browser notifications enabled</p>
          </div>
        )}
        
        {browserPermission === "denied" && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
            <BellOff className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">Browser notifications are blocked. Please enable them in your browser settings.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
