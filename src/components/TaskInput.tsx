import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface TaskInputProps {
  onAddTask: (taskText: string) => void;
  onClose: () => void;
}

export const TaskInput = ({ onAddTask, onClose }: TaskInputProps) => {
  const [taskText, setTaskText] = useState("");
  
  console.log("🔴 TaskInput RENDERED - This should not happen on every keystroke!");

  const handleSubmit = () => {
    if (taskText.trim()) {
      onAddTask(taskText.trim());
      setTaskText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-background border rounded-lg">
      <Input
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Enter your task..."
        autoFocus
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
  );
};