import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { UserData, formatDateKeyIST, Todo } from "@/lib/storage";
import { Plus, Trash2, Flame, Calendar } from "lucide-react";
import { todoTextSchema } from "@/lib/validation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface DayPanelProps {
  date: Date | null;
  userData: UserData;
  onUpdate: (updates: Partial<UserData>) => void;
  onClose: () => void;
  onToggleStreak: (date: Date) => void;
  open: boolean;
}

export const DayPanel = ({ date, userData, onUpdate, onClose, onToggleStreak, open }: DayPanelProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Auto-focus when panel opens
  useEffect(() => {
    if (open && inputRef.current && date) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, date]);

  if (!date) return null;

  const dateKey = formatDateKeyIST(date);
  const todos = userData.todos[dateKey] || [];
  const isStreak = userData.streaks.includes(dateKey);

  const addTodo = () => {
    const taskText = inputRef.current?.value?.trim() || "";

    const validationResult = todoTextSchema.safeParse(taskText);
    if (!validationResult.success) {
      toast.error(validationResult.error.issues[0]?.message ?? "Invalid task");
      return;
    }

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: validationResult.data,
      done: false,
    };

    const updatedTodos = {
      ...userData.todos,
      [dateKey]: [...todos, newTodo],
    };

    onUpdate({ todos: updatedTodos });

    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  const toggleTodo = (todoId: string) => {
    const updatedTodos = {
      ...userData.todos,
      [dateKey]: todos.map(t =>
        t.id === todoId ? { ...t, done: !t.done } : t
      ),
    };

    onUpdate({ todos: updatedTodos });

    const allComplete = updatedTodos[dateKey].every(t => t.done);
    if (userData.autoStreakOnComplete && allComplete && !isStreak) {
      onToggleStreak(date);
    }
  };

  const removeTodo = (todoId: string) => {
    const updatedTodos = {
      ...userData.todos,
      [dateKey]: todos.filter(t => t.id !== todoId),
    };

    onUpdate({ todos: updatedTodos });
  };

  const toggleAutoStreak = () => {
    onUpdate({ autoStreakOnComplete: !userData.autoStreakOnComplete });
  };

  const PanelContent = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            id="new-task-input"
            name="newTask"
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="Add a new task..."
            className="flex-1 h-11"
            autoComplete="off"
            defaultValue=""
          />
          <Button onClick={addTodo} size="icon" className="h-11 w-11 shrink-0">
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm p-3 rounded-xl bg-muted/30">
          <Checkbox
            id="auto-streak"
            checked={userData.autoStreakOnComplete}
            onCheckedChange={toggleAutoStreak}
          />
          <Label htmlFor="auto-streak" className="cursor-pointer text-xs sm:text-sm">
            Auto mark streak when all tasks complete
          </Label>
        </div>
      </div>

      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
        {todos.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <p className="text-muted-foreground">No tasks yet</p>
            <p className="text-xs text-muted-foreground/70">Add your first task above</p>
          </div>
        ) : (
          todos.map(todo => (
            <div
              key={todo.id}
              className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-muted/40 to-muted/20 hover:from-muted/60 hover:to-muted/40 transition-all duration-200 group border border-border/50"
            >
              <Checkbox
                checked={todo.done}
                onCheckedChange={() => toggleTodo(todo.id)}
                className="shrink-0"
              />
              <span className={`flex-1 text-sm sm:text-base transition-all ${todo.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {todo.text}
              </span>
              <Button
                onClick={() => removeTodo(todo.id)}
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 shrink-0"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {date.toLocaleDateString('en-US', { weekday: 'long' })}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <Button
                onClick={() => onToggleStreak(date)}
                variant={isStreak ? "default" : "outline"}
                size="sm"
                className="gap-2"
              >
                <Flame className="w-4 h-4" />
                {isStreak ? "Streak Day" : "Mark Streak"}
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${todos.length > 0 && todos.every(t => t.done) ? 'bg-green-500' : 'bg-muted'}`} />
                <span>{todos.length} {todos.length === 1 ? 'task' : 'tasks'}</span>
              </div>
              {todos.length > 0 && (
                <>
                  <span>•</span>
                  <span>{todos.filter(t => t.done).length} completed</span>
                </>
              )}
            </div>
          </DialogHeader>
          <PanelContent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="space-y-3 pb-4 border-b">
          <div className="space-y-2">
            <DrawerTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {date.toLocaleDateString('en-US', { weekday: 'long' })}
            </DrawerTitle>
            <p className="text-sm text-muted-foreground">
              {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${todos.length > 0 && todos.every(t => t.done) ? 'bg-green-500' : 'bg-muted'}`} />
                <span>{todos.length} {todos.length === 1 ? 'task' : 'tasks'}</span>
              </div>
              {todos.length > 0 && (
                <>
                  <span>•</span>
                  <span>{todos.filter(t => t.done).length} done</span>
                </>
              )}
            </div>
            <Button
              onClick={() => onToggleStreak(date)}
              variant={isStreak ? "default" : "outline"}
              size="sm"
              className="gap-2"
            >
              <Flame className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isStreak ? "Streak" : "Mark"}</span>
            </Button>
          </div>
        </DrawerHeader>
        <div className="p-4 overflow-y-auto">
          <PanelContent />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
