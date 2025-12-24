
export enum CharacterType {
  MOP = 'Mop',
  LEGO = 'Lego',
  BLEACH = 'Bleach',
  ENSEMBLE = 'Ensemble',
  CUSTOM = 'Custom'
}

export interface StylePreset {
  label: string;
  tempo: string;
  extraStyle: string;
  subGenres: string[];
  instruments: string[];
  vocalEmotion: string;
}

export interface CharacterConfig {
  id: CharacterType;
  name: string;
  subtitle: string;
  genres: string[];
  subGenres: string[];
  voiceTags: string[];
  instruments: string[];
  icon: string;
  themeColor: string;
  exampleStyles: StylePreset[];
}

export interface SongConfig {
  title: string;
  characterId: CharacterType;
  tempo: string;
  extraStyle: string;
  lyrics: string;
  selectedSubGenres: string[];
  selectedInstruments: string[];
  vocalEmotion: string;
  customName?: string;
  customIcon?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  config: SongConfig;
  preview: string;
}
