
import { CharacterType, CharacterConfig } from './types';

export const CHARACTERS: CharacterConfig[] = [
  {
    id: CharacterType.MOP,
    name: '拖把 (Mop)',
    subtitle: '英雄 / 受難者',
    genres: ['Rock Opera', 'Hard Rock'],
    subGenres: ['Classic Rock', 'Epic Musical', 'Heavy Metal', 'Orchestral Rock'],
    voiceTags: ['Male Tenor', 'Grit', 'Heroic', 'Emotional'],
    instruments: ['Distorted Guitar', 'Heavy Drums', 'Piano', 'Cello'],
    icon: '🧹',
    themeColor: 'blue',
    exampleStyles: [
      {
        label: '英雄讚歌',
        tempo: 'Epic and Dramatic',
        extraStyle: 'Heroic Anthem, Anthemic',
        subGenres: ['Orchestral Rock'],
        instruments: ['Piano', 'Cello'],
        vocalEmotion: 'Heroic'
      },
      {
        label: '絕望狂吼',
        tempo: 'Fast and Aggressive',
        extraStyle: 'Intense, High Energy',
        subGenres: ['Heavy Metal'],
        instruments: ['Distorted Guitar', 'Heavy Drums'],
        vocalEmotion: 'Grit'
      }
    ]
  },
  {
    id: CharacterType.LEGO,
    name: '樂高 (Lego)',
    subtitle: '瘋狂反派',
    genres: ['Dark Circus', 'Electro Swing'],
    subGenres: ['Avant-garde Metal', 'Villain Song', 'Cabaret', 'Industrial'],
    voiceTags: ['High-pitched Male', 'Manic', 'Nasal', 'Playful', 'Raspy'],
    instruments: ['Tuba', 'Xylophone', 'Brass', 'Pizzicato Strings', 'Organ'],
    icon: '🧱',
    themeColor: 'purple',
    exampleStyles: [
      {
        label: '詭異馬戲團',
        tempo: 'Bouncy and Playful',
        extraStyle: 'Creepy, Waltz Rhythm',
        subGenres: ['Cabaret', 'Villain Song'],
        instruments: ['Xylophone', 'Tuba'],
        vocalEmotion: 'Manic'
      },
      {
        label: '混亂節拍',
        tempo: 'Fast and Jittery',
        extraStyle: 'Glitchy, Chaotic',
        subGenres: ['Industrial'],
        instruments: ['Organ', 'Brass'],
        vocalEmotion: 'Raspy'
      }
    ]
  },
  {
    id: CharacterType.BLEACH,
    name: '漂白水 (Bleach)',
    subtitle: '神聖救贖者',
    genres: ['Symphonic Power Metal', 'Operatic Rock'],
    subGenres: ['Gothic Metal', 'Angelic Choir', 'Celestial', 'Progressive Metal'],
    voiceTags: ['Female Soprano', 'Operatic', 'Ethereal', 'Powerful', 'Vibrato'],
    instruments: ['Church Organ', 'Choir', 'Double Kick Drum', 'Harp'],
    icon: '🧪',
    themeColor: 'teal',
    exampleStyles: [
      {
        label: '聖光降臨',
        tempo: 'Epic and Slow',
        extraStyle: 'Celestial, Spiritual',
        subGenres: ['Angelic Choir'],
        instruments: ['Church Organ', 'Choir'],
        vocalEmotion: 'Ethereal'
      },
      {
        label: '淨化之焰',
        tempo: 'Fast and Powerful',
        extraStyle: 'Intense, Triumphant',
        subGenres: ['Progressive Metal'],
        instruments: ['Double Kick Drum', 'Harp'],
        vocalEmotion: 'Powerful'
      }
    ]
  },
  {
    id: CharacterType.ENSEMBLE,
    name: '大合唱 / 史詩',
    subtitle: '決戰 / 序曲',
    genres: ['Symphonic Metal', 'Broadway Finale'],
    subGenres: ['Cinematic', 'Battle Theme', 'Anthemic', 'Grand Finale'],
    voiceTags: ['Ensemble', 'Mixed Vocals', 'Antiphonal Choir', 'Group Chant'],
    instruments: ['Orchestral Hits', 'Full Band', 'Timpani', 'Trumpets'],
    icon: '⚔️',
    themeColor: 'amber',
    exampleStyles: [
      {
        label: '終極對決',
        tempo: 'Grand and Triumphant',
        extraStyle: 'Epic Finale, Broadway Vibe',
        subGenres: ['Grand Finale'],
        instruments: ['Orchestral Hits', 'Trumpets'],
        vocalEmotion: 'Ensemble'
      },
      {
        label: '遠征序曲',
        tempo: 'Stately and March-like',
        extraStyle: 'Military March, Cinematic',
        subGenres: ['Battle Theme'],
        instruments: ['Timpani', 'Full Band'],
        vocalEmotion: 'Group Chant'
      }
    ]
  },
  {
    id: CharacterType.CUSTOM,
    name: '自訂英雄',
    subtitle: '傳奇創世者',
    genres: ['Epic Score', 'Cinematic Rock'],
    subGenres: ['Fantasy Metal', 'Orchestral Hybrid', 'Electronic Epic'],
    voiceTags: ['Mixed Vocals', 'Powerful', 'Dramatic', 'Dynamic'],
    instruments: ['Synth', 'Orchestra', 'Electric Guitar', 'Percussion'],
    icon: '👤',
    themeColor: 'blue',
    exampleStyles: [
      {
        label: '創世傳說',
        tempo: 'Dynamic and Vast',
        extraStyle: 'Legendary, Cinematic',
        subGenres: ['Orchestral Hybrid'],
        instruments: ['Synth', 'Orchestra'],
        vocalEmotion: 'Powerful'
      }
    ]
  }
];

export const TAG_CATEGORIES = [
  {
    label: '基礎結構 (Basic)',
    tags: [
      { label: '開場', tag: '[Intro]', desc: 'Opening of the song' },
      { label: '主歌', tag: '[Verse]', desc: 'Storytelling section' },
      { label: '導歌', tag: '[Pre-Chorus]', desc: 'Building tension' },
      { label: '副歌', tag: '[Chorus]', desc: 'Main hook and climax' },
      { label: '結尾', tag: '[Outro]', desc: 'Ending section' }
    ]
  },
  {
    label: '記憶點 (Leitmotif)',
    tags: [
      { label: '洗腦鉤子', tag: '[Hook]', desc: 'Catchy repetitive part' },
      { label: '廣告短曲', tag: '[Jingle]', desc: 'Short memorable tune' },
      { label: '記憶旋律', tag: '[Refrain]', desc: 'Recurring theme' }
    ]
  },
  {
    label: '轉折與動態 (Transition)',
    tags: [
      { label: '橋段', tag: '[Bridge]', desc: 'Musical diversion' },
      { label: '間奏', tag: '[Break]', desc: 'Short instrumental pause' },
      { label: '爆發點', tag: '[Drop]', desc: 'Rhythmic impact point' },
      { label: '風格切換', tag: '[Genre Switch]', desc: 'Shift style mid-song' }
    ]
  },
  {
    label: '表情指令 (Cues)',
    tags: [
      { label: '輕語', tag: '[Whisper]', desc: 'Quiet vocal delivery' },
      { label: '嘶吼', tag: '[Scream]', desc: 'High energy vocal' },
      { label: '朗誦', tag: '[Spoken Word]', desc: 'Narration style' },
      { label: '史詩合唱', tag: '[Epic Choir]', desc: 'Grand choir backing' }
    ]
  }
];
