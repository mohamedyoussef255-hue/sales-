class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onStateChangeCallback: ((speaking: boolean) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public setOnStateChange(cb: (speaking: boolean) => void) {
    this.onStateChangeCallback = cb;
  }

  public speak(text: string, rate = 1.0, onEnd?: () => void) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    this.stop();

    // Clean markdown symbols for cleaner voice
    const cleanText = text
      .replace(/[*#_`~>]/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-EG';
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Pick best Arabic voice
    const voices = this.synth.getVoices();
    const arabicVoice = voices.find(v => v.lang.includes('ar-EG') || v.lang.includes('ar'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onstart = () => {
      if (this.onStateChangeCallback) this.onStateChangeCallback(true);
    };

    utterance.onend = () => {
      if (this.onStateChangeCallback) this.onStateChangeCallback(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (this.onStateChangeCallback) this.onStateChangeCallback(false);
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      if (this.onStateChangeCallback) this.onStateChangeCallback(false);
    }
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}

export const speechService = new SpeechService();
