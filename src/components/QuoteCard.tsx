import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Quote } from "lucide-react";
import { getRandomQuote } from "@/lib/quotes";
import { UserData } from "@/lib/storage";

interface QuoteCardProps {
  userData: UserData;
  onUpdate: (updates: Partial<UserData>) => void;
}

export const QuoteCard = ({ userData, onUpdate }: QuoteCardProps) => {
  const [currentQuote, setCurrentQuote] = useState(() => {
    const { quote, index } = getRandomQuote(userData.quotesSeen);
    return { quote, index };
  });

  const handleNextQuote = () => {
    const { quote, index } = getRandomQuote(userData.quotesSeen);
    setCurrentQuote({ quote, index });
    
    const newSeenQuotes = [...userData.quotesSeen, index];
    onUpdate({ quotesSeen: newSeenQuotes });
  };

  return (
    <Card className="group p-8 shadow-card hover:shadow-elevated transition-all duration-300 bg-gradient-to-br from-card via-primary/5 to-accent/5 border-2 hover:border-primary/30">
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 p-3 rounded-2xl shrink-0 group-hover:bg-primary/20 transition-colors">
          <Quote className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed italic transition-all">
            "{currentQuote.quote}"
          </p>
        </div>
        <Button
          onClick={handleNextQuote}
          size="icon"
          variant="ghost"
          className="shrink-0 hover:bg-primary/10 hover:text-primary transition-all hover:rotate-180 duration-300"
          title="Get new quote"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>
    </Card>
  );
};
