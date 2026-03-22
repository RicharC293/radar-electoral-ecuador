const botPattern = /bot|spider|crawler|headless|curl|wget/i;

export function isBotUserAgent(userAgent: string | null | undefined) {
  return botPattern.test(userAgent ?? "");
}

export function roundCoordinate(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return Number(value.toFixed(2));
}
