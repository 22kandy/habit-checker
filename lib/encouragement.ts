const ENCOURAGEMENT_MESSAGES = [
  "Great job! Keep it up!",
  "You're doing amazing!",
  "Every step counts!",
  "You're building great habits!",
  "Keep going!",
  "You're on fire!",
  "Consistency is key!",
  "Well done!",
];

const MILESTONE_MESSAGES: Record<number, string> = {
  3: "3 days in a row! You're building momentum!",
  7: "A full week! You're unstoppable!",
  14: "Two weeks strong! Keep it going!",
  30: "A whole month! Incredible dedication!",
  100: "100 days! You're a habit master!",
};

/**
 * Get an encouraging message based on the current streak
 */
export function getEncouragementMessage(streak: number): string {
  // Check for milestone messages first
  if (MILESTONE_MESSAGES[streak]) {
    return MILESTONE_MESSAGES[streak];
  }

  // Use random encouragement for regular completions
  const randomIndex = Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length);
  return ENCOURAGEMENT_MESSAGES[randomIndex];
}

/**
 * Get a message encouraging the user to check the next habit
 */
export function getNextHabitMessage(remainingCount: number): string {
  if (remainingCount === 0) {
    return "All done for today! You're amazing!";
  }
  if (remainingCount === 1) {
    return "One more to go! You've got this!";
  }
  return `Only ${remainingCount} more to go! Keep it up!`;
}

