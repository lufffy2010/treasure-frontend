import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Flame, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";

import { ThemeSelector } from "@/components/ThemeSelector";
import { usernameSchema, passwordSchema } from "@/lib/validation";

const avatarOptions = [
  "🏴‍☠️", "⚔️", "🗡️", "⚓", "🦜", "🌊", "💀", "🏴", "⛵", "🧭", "🔱", "💰", "🗺️", "🍻", "👑"
];

const STRAW_HAT_EMOJI = "👒";

interface AuthPageProps {
  onAuth: () => void;
}

export const AuthPage = ({ onAuth }: AuthPageProps) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isStrawHatUnlocked, setIsStrawHatUnlocked] = useState(false);

  // Cheat code listener
  useEffect(() => {
    const cheatCode = "captain";
    let inputSequence = "";

    const handleKeyDown = (e: KeyboardEvent) => {
      inputSequence += e.key.toLowerCase();
      if (inputSequence.length > cheatCode.length) {
        inputSequence = inputSequence.slice(-cheatCode.length);
      }

      if (inputSequence === cheatCode) {
        setIsStrawHatUnlocked(true);
        toast.success("🏴‍☠️ The Captain has arrived!", {
          description: "Straw Hat avatar unlocked!",
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleStrawHatClick = () => {
    if (isStrawHatUnlocked) {
      setSelectedAvatar(STRAW_HAT_EMOJI);
    } else {
      toast.error("🏴‍☠️ Only the Captain can wear the Straw Hat!", {
        description: "Choose another badge for now, rookie!",
        duration: 3000,
      });
    }
  };

  const handleAvatarSelect = (avatar: string) => {
    if (avatar === STRAW_HAT_EMOJI) {
      handleStrawHatClick();
    } else {
      setSelectedAvatar(avatar);
    }
  };

  const handleAuth = async () => {
    try {
      setError("");

      // Validate required fields - DIFFERENT FOR LOGIN VS REGISTER
      if (isLogin) {
        // For LOGIN: require email and password
        if (!email.trim() || !password.trim()) {
          setError("Email and password are required");
          return;
        }
      } else {
        // For REGISTER: require username, email, and password
        if (!username.trim() || !email.trim() || !password.trim()) {
          setError("All fields are required");
          return;
        }
      }

      // Only validate username during registration
      if (!isLogin) {
        const usernameResult = usernameSchema.safeParse(username);
        if (!usernameResult.success) {
          setError(usernameResult.error.issues[0]?.message ?? "Invalid username");
          return;
        }
      }

      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        setError(passwordResult.error.issues[0]?.message ?? "Invalid password");
        return;
      }

      setLoading(true);

      if (isLogin) {
        // LOGIN CALL
        const loginRes = await api.login({
          email: email.trim(),
          password: password.trim(),
        });

        if (loginRes.token) {
          localStorage.setItem("token", loginRes.token);
          toast.success("⚔️ Welcome back!");
          onAuth();
        } else {
          setError(loginRes.message ?? "Login failed");
        }
      } else {
        // REGISTER CALL
        const registerRes = await api.register({
          username: username.trim(),
          email: email.trim(),
          password: password.trim(),
          avatar: selectedAvatar,
        });

        if (!registerRes.success && registerRes.message) {
          setError(registerRes.message);
          return;
        }

        toast.success("🏴‍☠️ Account created!");

        // AUTO LOGIN after registration
        const loginRes = await api.login({
          email: email.trim(),
          password: password.trim(),
        });

        if (loginRes.token) {
          localStorage.setItem("token", loginRes.token);
        }

        onAuth();
      }
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        "Unknown error occurred";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-3 sm:p-4">
      <Card className="w-full max-w-md p-5 sm:p-8 shadow-elevated animate-scale-in relative">
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <ThemeSelector />
        </div>

        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="bg-primary/10 p-3 sm:p-4 rounded-full mb-3 sm:mb-4 animate-pulse-glow">
            <Flame className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-fire-flicker" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 text-center leading-tight">
            🌊 Grand Sea Saga
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground text-center px-2">
            Set sail on your adventure of progress and mastery
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Show username field only during registration */}
          {!isLogin && (
            <div>
              <Label className="text-sm sm:text-base font-medium">
                Create Username
              </Label>
              <Input
                placeholder="Enter username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
              />
            </div>
          )}

          {/* Email Input Field - ALWAYS SHOW for both login and register */}
          <div>
            <Label className="text-sm sm:text-base font-medium">
              {isLogin ? "Your Email" : "Your Email"}
            </Label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
            />
          </div>

          <div>
            <Label className="text-sm sm:text-base font-medium">
              {isLogin ? "Password" : "Create Password"}
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <Label className="font-medium mb-2 block">
                Choose Your Crew Badge ⚔️
              </Label>

              <div className="grid grid-cols-5 gap-2">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => handleAvatarSelect(avatar)}
                    className={`text-2xl p-2 rounded-xl transition ${selectedAvatar === avatar
                      ? "bg-primary/20 ring-2 ring-primary"
                      : "bg-muted hover:bg-muted/80"
                      }`}
                  >
                    {avatar}
                  </button>
                ))}

                {/* Straw Hat Emoji Button */}
                <button
                  type="button"
                  onClick={handleStrawHatClick}
                  className="text-2xl p-2 rounded-xl bg-muted hover:bg-muted/80 transition"
                >
                  {STRAW_HAT_EMOJI}
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button
            className="w-full py-5 font-semibold"
            disabled={loading}
            onClick={handleAuth}
          >
            {loading
              ? "⚓ Loading..."
              : isLogin
                ? "🏴‍☠️ Set Sail"
                : "⚔️ Join the Crew"}
          </Button>

          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              // Don't clear email when switching to login
              if (isLogin) {
                // When switching FROM login TO register, clear email
                setEmail("");
              }
            }}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            {isLogin
              ? "New sailor? Join the crew"
              : "Already a crew mate? Set sail"}
          </button>
        </div>
      </Card>
    </div>
  );
};