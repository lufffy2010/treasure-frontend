import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { createPortal } from "react-dom";
import { UserData, formatDateKeyIST } from "@/lib/storage";

interface SimpleTaskModalProps {
  isOpen: boolean;
  selectedDate: Date | null;
  userData: UserData;
  onAddTask: (date: Date, taskText: string) => void;
  onClose: () => void;
}

export const SimpleTaskModal = ({ 
  isOpen, 
  selectedDate, 
  userData, 
  onAddTask, 
  onClose 
}: SimpleTaskModalProps) => {
  const [taskText, setTaskText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  console.log("🔵 SimpleTaskModal RENDERED");

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (taskText.trim() && selectedDate) {
      onAddTask(selectedDate, taskText.trim());
      setTaskText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  if (!isOpen || !selectedDate) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background p-4 rounded-lg w-full max-w-sm border-2 shadow-xl">
        <h3 className="text-lg font-semibold mb-4 text-center">
          Tasks for {selectedDate.toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h3>
        
        <div className="flex items-center gap-2 p-2 bg-background border rounded-lg">
          <Input
            ref={inputRef}
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your task..."
            className="flex-1"
          />
          <Button
            onClick={handleSubmit}
            size="sm"
            disabled={!taskText.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            onClick={onClose}
            size="sm"
            variant="outline"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
          {userData.todos[formatDateKeyIST(selectedDate)]?.map((task, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
              <span className={task.done ? "line-through text-muted-foreground" : ""}>
                {task.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};