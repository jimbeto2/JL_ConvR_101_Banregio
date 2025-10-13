export interface LanguageOption {
  locale_code: string;
  language?: string;
  ttsProvider?: string;
  ttsLanguage?: string;
  voice?: string;
  transcriptionProvider?: string;
  transcriptionLanguage?: string;
  speechModel?: string;
  jlWelcomeGreeting?: string;
}

export const languageOptions: { [key: string]: LanguageOption } = {
  
  portuguese: {
    locale_code: "pt-BR",
    ttsProvider: "ElevenLabs",
    ttsLanguage: "pt-BR",
    voice: "iScHbNW8K33gNo3lGgbo",
    transcriptionProvider: "Deepgram",
    transcriptionLanguage: "pt-BR",
    speechModel: "nova-2-general",
  },
  spanish: {
    jlWelcomeGreeting: "Hola cara de bola",
    locale_code: "es-ES",
    ttsProvider: "ElevenLabs",
    voice: "x5IDPSl4ZUbhosMmVFTk",
    transcriptionProvider: "Deepgram",
    transcriptionLanguage: 'es',
    speechModel: "nova-2-general",

  },
  english: {
    locale_code: "en-US",
    ttsProvider: "google",
    voice: "en-US-Journey-O",
    transcriptionProvider: "google",
    speechModel: "telephony",
  },
};
