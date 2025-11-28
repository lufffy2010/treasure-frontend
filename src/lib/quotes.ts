export const motivationalQuotes = [
  "The expert in anything was once a beginner.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Don't watch the clock; do what it does. Keep going.",
  "The secret to getting ahead is getting started.",
  "Study while others are sleeping; work while others are loafing.",
  "Education is the most powerful weapon which you can use to change the world.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "Strive for progress, not perfection.",
  "Your future is created by what you do today, not tomorrow.",
  "The only way to learn mathematics is to do mathematics.",
  "Knowledge is power. Information is liberating.",
  "The capacity to learn is a gift; the ability to learn is a skill.",
  "Focus on being productive instead of busy.",
  "Small daily improvements over time lead to stunning results.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "What we learn with pleasure we never forget.",
  "Learning never exhausts the mind.",
  "Live as if you were to die tomorrow. Learn as if you were to live forever.",
  "An investment in knowledge pays the best interest.",
  "The more that you read, the more things you will know.",
];

export const getRandomQuote = (exclude: number[] = []): { quote: string; index: number } => {
  const available = motivationalQuotes
    .map((q, i) => ({ quote: q, index: i }))
    .filter(item => !exclude.includes(item.index));
  
  if (available.length === 0) {
    // Reset if all seen
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return { quote: motivationalQuotes[randomIndex], index: randomIndex };
  }
  
  const randomItem = available[Math.floor(Math.random() * available.length)];
  return randomItem;
};
