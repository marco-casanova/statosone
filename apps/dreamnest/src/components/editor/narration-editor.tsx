"use client";

import { useState, useRef, useEffect } from "react";

type NarrationMode = "recorded" | "tts";

interface Narration {
  id: string;
  mode: NarrationMode;
  audio_asset_id: string | null;
  tts_text: string | null;
  tts_voice: string | null;
  duration_ms: number | null;
}

interface NarrationEditorProps {
  pageId: string;
  narration: Narration | null;
  page?: {
    background_music_asset_id?: string | null;
    background_music_loop?: boolean | null;
  };
  onSave: (data: {
    mode: NarrationMode;
    audio_asset_id?: string | null;
    tts_text?: string | null;
    tts_voice?: string | null;
    duration_ms?: number | null;
  }) => Promise<void>;
  onDelete: () => Promise<void>;
  onPageUpdate?: (updates: {
    background_music_asset_id?: string | null;
    background_music_loop?: boolean | null;
  }) => void;
  onOpenAssetLibrary: () => void;
  audioUrl?: string;
}

const TTS_VOICES = [
  {
    id: "alloy",
    name: "Alloy",
    description: "Neutral and balanced",
    emoji: "🎭",
  },
  { id: "echo", name: "Echo", description: "Warm and friendly", emoji: "🌟" },
  {
    id: "fable",
    name: "Fable",
    description: "Storytelling voice",
    emoji: "📖",
  },
  {
    id: "onyx",
    name: "Onyx",
    description: "Deep and authoritative",
    emoji: "🎩",
  },
  {
    id: "nova",
    name: "Nova",
    description: "Bright and energetic",
    emoji: "✨",
  },
  {
    id: "shimmer",
    name: "Shimmer",
    description: "Gentle and soothing",
    emoji: "🌙",
  },
];

export function NarrationEditor({
  pageId,
  narration,
  page,
  onSave,
  onDelete,
  onPageUpdate,
  onOpenAssetLibrary,
  audioUrl,
}: NarrationEditorProps) {
  const [mode, setMode] = useState<NarrationMode>(narration?.mode || "tts");
  const [ttsText, setTtsText] = useState(narration?.tts_text || "");
  const [ttsVoice, setTtsVoice] = useState(narration?.tts_voice || "fable");
  const [isSaving, setIsSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (narration) {
      setMode(narration.mode);
      setTtsText(narration.tts_text || "");
      setTtsVoice(narration.tts_voice || "fable");
    }
  }, [narration]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        mode,
        tts_text: mode === "tts" ? ttsText : null,
        tts_voice: mode === "tts" ? ttsVoice : null,
        audio_asset_id: mode === "recorded" ? narration?.audio_asset_id : null,
        duration_ms: null, // Will be calculated from audio
      });
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const startRecording = async () => {
    // In a real implementation, this would use the MediaRecorder API
    setIsRecording(true);
    setRecordingTime(0);
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime((t) => t + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    // In a real implementation, this would save the recording
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Narration Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setMode("tts");
              setHasChanges(true);
            }}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
              mode === "tts"
                ? "border-purple-500 bg-purple-50 text-purple-700"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className="text-xl">🤖</span>
            <div className="text-left">
              <div className="font-medium text-sm">Text-to-Speech</div>
              <div className="text-xs text-gray-500">AI-generated voice</div>
            </div>
          </button>
          <button
            onClick={() => {
              setMode("recorded");
              setHasChanges(true);
            }}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
              mode === "recorded"
                ? "border-purple-500 bg-purple-50 text-purple-700"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className="text-xl">🎙️</span>
            <div className="text-left">
              <div className="font-medium text-sm">Recorded</div>
              <div className="text-xs text-gray-500">Your own voice</div>
            </div>
          </button>
        </div>
      </div>

      {/* TTS Mode */}
      {mode === "tts" && (
        <div className="space-y-4">
          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Narration Text
            </label>
            <textarea
              value={ttsText}
              onChange={(e) => {
                setTtsText(e.target.value);
                setHasChanges(true);
              }}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="Enter the text to be read aloud on this page..."
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">
                {ttsText.length} characters
              </span>
              <span className="text-xs text-gray-500">
                ~{Math.ceil(ttsText.split(/\s+/).length / 150)} min
              </span>
            </div>
          </div>

          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TTS_VOICES.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => {
                    setTtsVoice(voice.id);
                    setHasChanges(true);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                    ttsVoice === voice.id
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">{voice.emoji}</span>
                  <div>
                    <div className="font-medium text-sm">{voice.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {voice.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview Button */}
          <button
            className="w-full py-2 border border-purple-200 text-purple-600 rounded-xl font-medium hover:bg-purple-50 flex items-center justify-center gap-2"
            disabled={!ttsText.trim()}
          >
            <span>▶️</span>
            <span>Preview Voice</span>
          </button>
        </div>
      )}

      {/* Recorded Mode */}
      {mode === "recorded" && (
        <div className="space-y-4">
          {audioUrl ? (
            <div className="space-y-3">
              {/* Audio Player */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-xl text-white">🎵</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-purple-700">
                      Audio Narration
                    </p>
                    <p className="text-xs text-purple-500">
                      {narration?.duration_ms
                        ? formatTime(Math.round(narration.duration_ms / 1000))
                        : "Duration unknown"}
                    </p>
                  </div>
                </div>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  className="w-full h-10"
                />
              </div>

              {/* Replace/Remove Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onOpenAssetLibrary}
                  className="py-2 text-purple-600 border border-purple-200 rounded-xl font-medium hover:bg-purple-50 text-sm"
                >
                  Replace Audio
                </button>
                <button
                  onClick={onDelete}
                  className="py-2 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-50 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Recording Interface */}
              {isRecording ? (
                <div className="bg-red-50 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 mx-auto bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-2xl">🎙️</span>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-red-600">
                    {formatTime(recordingTime)}
                  </p>
                  <p className="text-sm text-red-500">Recording...</p>
                  <button
                    onClick={stopRecording}
                    className="mt-4 px-6 py-2 bg-red-500 text-white rounded-full font-medium hover:bg-red-600"
                  >
                    Stop Recording
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={startRecording}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">🎙️</span>
                    <span>Start Recording</span>
                  </button>

                  <div className="text-center text-sm text-gray-500">or</div>

                  <button
                    onClick={onOpenAssetLibrary}
                    className="w-full py-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-xl font-medium hover:bg-purple-50 flex items-center justify-center gap-2"
                  >
                    <span>📁</span>
                    <span>Upload Audio File</span>
                  </button>
                </div>
              )}

              {/* Recording Tips */}
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-xs text-amber-700 font-medium mb-1">
                  💡 Recording Tips
                </p>
                <ul className="text-xs text-amber-600 space-y-0.5">
                  <li>• Speak clearly and at a steady pace</li>
                  <li>• Record in a quiet environment</li>
                  <li>• Supported formats: MP3, WAV, M4A</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save Button */}
      {hasChanges && (
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>💾</span>
              <span>Save Narration</span>
            </>
          )}
        </button>
      )}

      {/* Divider */}
      <div className="border-t border-gray-200 my-6" />

      {/* Background Music Section */}
      {onPageUpdate && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Music
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Add ambient music that loops while reading this page
            </p>
          </div>

          {page?.background_music_asset_id ? (
            <div className="space-y-3">
              {/* Music Player */}
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-xl text-white">🎶</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-indigo-700">
                      Background Music Set
                    </p>
                    <p className="text-xs text-indigo-500">
                      Loops while reading
                    </p>
                  </div>
                </div>

                {/* Loop Toggle */}
                <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                  <span className="text-sm text-gray-700">Loop Music</span>
                  <button
                    onClick={() =>
                      onPageUpdate({
                        background_music_loop:
                          !(page?.background_music_loop ?? false),
                      })
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      page?.background_music_loop !== false
                        ? "bg-purple-500"
                        : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        page?.background_music_loop !== false
                          ? "translate-x-6"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() =>
                  onPageUpdate({
                    background_music_asset_id: null,
                    background_music_loop: null,
                  })
                }
                className="w-full py-2 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-50 text-sm"
              >
                Remove Background Music
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Upload Interface */}
              <div className="border-2 border-dashed border-indigo-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
                <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl">🎵</span>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Drop music file here
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  or click to browse
                </p>
                <button
                  onClick={() => {
                    // This would open a music-specific asset library
                    // For now, we'll simulate setting the background music
                    // In production, this would trigger onOpenAssetLibrary
                    // with a callback to set background_music_asset_id
                  }}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 text-sm"
                >
                  Choose Music File
                </button>
              </div>

              {/* Music Tips */}
              <div className="bg-indigo-50 rounded-xl p-3">
                <p className="text-xs text-indigo-700 font-medium mb-1">
                  🎵 Background Music Tips
                </p>
                <ul className="text-xs text-indigo-600 space-y-0.5">
                  <li>• Use calm, ambient music</li>
                  <li>• Keep volume low (20-30%)</li>
                  <li>• Music loops automatically</li>
                  <li>• Supported: MP3, WAV, M4A</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
