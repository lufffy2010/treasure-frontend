import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { usernameSchema } from "@/lib/validation";
import { api } from "@/services/api";

const avatarOptions = [
  "🏴", "⚔️", "🔱", "⚓", "🦜", "🧭", "💀", "🏴‍☠️", "🗡️", "🚢", "🍻", "💰", "🗺️", "💬", "👑"
];

interface ProfileMenuProps {
  onUpdate: () => void;
}

export const ProfileMenu = ({ onUpdate }: ProfileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [newUsername, setNewUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [historyPushed, setHistoryPushed] = useState(false);

  // Load profile when user is available (not just when dialog opens)
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    if (user && isOpen) {
      loadProfile();
    }
  }, [user, isOpen]);

  // Handle mobile back button for dialog
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (isOpen) {
        setIsOpen(false);
        event.preventDefault();
      }
    };

    if (isOpen && !historyPushed) {
      window.history.pushState({ dialogOpen: true }, '', window.location.pathname);
      setHistoryPushed(true);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (historyPushed && !isOpen) {
        setHistoryPushed(false);
      }
    };
  }, [isOpen, historyPushed]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      console.log('Loading profile with token:', token ? 'exists' : 'missing');

      const data = await api.getCurrentUser(token || undefined);
      console.log('Profile data received:', data);

      const userData = data.user;
      setProfile(userData);
      setNewUsername(userData?.username || "");
      setSelectedAvatar(userData?.avatar || avatarOptions[0]);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate username with zod
    const usernameResult = usernameSchema.safeParse(newUsername);
    if (!usernameResult.success) {
      setError(usernameResult.error.issues[0]?.message ?? "Invalid username");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      // Update via backend
      console.log('Updating profile:', { username: newUsername.trim(), avatar: selectedAvatar });

      await api.updateProfile({
        username: newUsername.trim(),
        avatar: selectedAvatar,
      });

      toast.success("Profile Updated", {
        description: "Your profile has been saved successfully!",
      });

      // Refresh profile data
      await loadProfile();
      onUpdate();
      setIsOpen(false);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      if (err.message === 'Username already taken') {
        setError('Username already taken');
      } else {
        setError("Failed to update profile. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      // Call backend to delete account
      console.log('Deleting account...');
      await api.deleteAccount();

      // Clear all localStorage data for this user
      const userId = (user as any)?._id ?? (user as any)?.id;
      localStorage.removeItem(`userData_${userId}`);

      // Clear notification preferences and settings
      if (profile?.username) {
        localStorage.removeItem(`notification_preferences_${profile.username}`);
        localStorage.removeItem(`summary_shown_date_${profile.username}`);
      }

      toast.success("🌊 Account Deleted", {
        description: `Your account and all notification settings have been permanently deleted. Farewell, ${profile?.username || 'friend'}.`,
      });

      // Sign out and redirect
      await signOut();
      window.location.href = "/";
    } catch (err: any) {
      console.error("Error deleting account:", err);
      toast.error("❌ Error", {
        description: "Failed to delete account. Please try again.",
      });
    }
  };

  if (!user) return null;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="gap-2"
      >
        <span className="text-2xl">{profile?.avatar || selectedAvatar}</span>
        <span className="hidden sm:inline text-sm font-medium">{profile?.username || user?.username || "Profile"}</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl sm:text-3xl">⚓ Your Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newUsername}
                onChange={(e) => {
                  setNewUsername(e.target.value);
                  setError("");
                }}
                className="mt-2"
                placeholder="Enter your username"
              />
              {error && (
                <p className="text-destructive text-sm mt-2">{error}</p>
              )}
            </div>

            <div>
              <Label className="mb-3 block">Profile Avatar</Label>
              <div className="grid grid-cols-5 gap-2">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`text-3xl p-3 rounded-2xl transition-all hover:scale-110 ${selectedAvatar === avatar
                      ? "bg-primary/20 ring-2 ring-primary"
                      : "bg-muted hover:bg-muted/70"
                      }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
                <User className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button onClick={handleLogout} variant="destructive" className="flex-1" disabled={isSaving}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>

            <div className="pt-4 border-t border-border">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account Permanently
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>⚠️ Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>This action cannot be undone. This will permanently delete your account and remove all your data from our servers.</p>
                      <p className="font-semibold text-destructive">All your progress, streaks, tasks, and subjects will be lost forever.</p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                      Yes, Delete My Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};