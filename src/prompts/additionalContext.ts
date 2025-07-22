
export function getAdditionalContext(): string {
    const now = new Date();
    console.log()
    return `Current date and time: ${now.toISOString()}`;
  }
  