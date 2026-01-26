/**
 * Available TTS voices for narration
 */
export const TTS_VOICES = [
  { id: "alloy", name: "Alloy", description: "Neutral and balanced" },
  { id: "echo", name: "Echo", description: "Warm and friendly" },
  { id: "fable", name: "Fable", description: "Storytelling voice" },
  { id: "onyx", name: "Onyx", description: "Deep and authoritative" },
  { id: "nova", name: "Nova", description: "Bright and energetic" },
  { id: "shimmer", name: "Shimmer", description: "Gentle and soothing" },
] as const;

export type TTSVoiceId = (typeof TTS_VOICES)[number]["id"];
