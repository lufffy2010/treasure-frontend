import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff } from "lucide-react";
import { getCurrentUser } from "@/lib/storage";

interface FocusModePreferences {
  blockNotifications: boolean;
}

const getFocusModePreferences = (): FocusModePreferences => {
  const username = getCurrentUser();
  if (!username) {
    return { blockNotifications: false };
  }
  
  const stored = localStorage.getItem(`focus_mode_preferences_${username}`);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    blockNotifications: false,
  };
};

const saveFocusModePreferences = (prefs: FocusModePreferences) => {
  const username = getCurrentUser();
  if (!username) return;
  
  localStorage.setItem(`focus_mode_preferences_${username}`, JSON.stringify(prefs));
};

export const FocusModeSettings = () => {
  const [prefs, setPrefs] = useState<FocusModePreferences>(getFocusModePreferences());

  const handleToggle = (key: keyof FocusModePreferences) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    saveFocusModePreferences(newPrefs);
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center gap-3 mb-4">
        {prefs.blockNotifications ? (
          <BellOff className="w-5 h-5 text-destructive" />
        ) : (
          <Bell className="w-5 h-5 text-primary" />
        )}
        <h3 className="text-xl font-semibold">Focus Mode Settings</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="block-notifications" className="text-base font-medium">
              Block All Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Prevent browser notifications during focus sessions
            </p>
          </div>
          <Switch
            id="block-notifications"
            checked={prefs.blockNotifications}
            onCheckedChange={() => handleToggle('blockNotifications')}
          />
        </div>
      </div>
    </Card>
  );
};

export const getFocusModeBlockStatus = (): boolean => {
  const prefs = getFocusModePreferences();
  return prefs.blockNotifications;
};
