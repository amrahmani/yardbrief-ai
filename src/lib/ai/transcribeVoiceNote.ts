export interface VoiceNoteTranscriptionPlaceholderResult {
  transcript: string;
  message: string;
}

// This placeholder keeps the upload flow simple for the web MVP.
// Future speech-to-text work can replace this stub without changing the form shape.
export async function transcribeVoiceNotePlaceholder(
  fileName: string,
): Promise<VoiceNoteTranscriptionPlaceholderResult> {
  return {
    transcript: "",
    message: `Automatic transcription coming soon. ${fileName} was uploaded successfully.`,
  };
}
