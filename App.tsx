
import React, { useState, useMemo, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { CHARACTERS, TAG_CATEGORIES } from './constants';
import { CharacterType, CharacterConfig, SongConfig, HistoryItem, StylePreset } from './types';

const STORAGE_KEY = 'mop_of_the_king_archives';

const MOTTOES = [
  "即便最頑固的污漬，在你的意志面前也將顫抖。",
  "混亂的樂高地板，正是英雄史詩誕生的基石。",
  "每一滴漂白水，都承載著淨化宇宙的聖光。",
  "拖把揮舞之處，即是正義伸張之時。",
  "灰塵雖小，卻擋不住追求潔淨的壯闊胸懷。",
  "在泡沫與纖維之間，隱藏著命運的終極真理。",
  "勇者不懼髒污，只怕心中失去對閃亮渴望。"
];

const GENERATION_TONES = [
  { id: 'epic', label: '史詩中二', icon: '🔥', desc: '宏大敘事、莊嚴且中二感爆棚' },
  { id: 'emotional', label: '感性悲愴', icon: '💧', desc: '細膩情感、描繪受難與自省' },
  { id: 'comedy', label: '荒誕喜劇', icon: '🤡', desc: '輕快幽默、諷刺與瘋狂的清潔日常' },
  { id: 'action', label: '熱血戰鬥', icon: '⚡', desc: '節奏緊湊、與髒汙的正面對決' },
  { id: 'mystery', label: '神秘空靈', icon: '✨', desc: '夢幻純淨、如神蹟般的清潔過程' }
];

const CharacterSelector: React.FC<{ 
  selected: CharacterType; 
  onSelect: (id: CharacterType) => void;
  customName: string;
  customIcon: string;
}> = ({ selected, onSelect, customName, customIcon }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {CHARACTERS.map(char => {
        const isSelected = selected === char.id;
        const colorClasses = {
          blue: isSelected ? 'border-blue-500 bg-blue-900/40 text-blue-50' : 'border-slate-800 text-slate-500',
          purple: isSelected ? 'border-purple-500 bg-purple-900/40 text-purple-50' : 'border-slate-800 text-slate-500',
          teal: isSelected ? 'border-teal-500 bg-teal-900/40 text-teal-50' : 'border-slate-800 text-slate-500',
          amber: isSelected ? 'border-amber-500 bg-amber-900/40 text-amber-50' : 'border-slate-800 text-slate-500',
        }[char.themeColor];

        const displayIcon = char.id === CharacterType.CUSTOM ? (customIcon || char.icon) : char.icon;
        const displayName = char.id === CharacterType.CUSTOM ? (customName || char.name) : char.name;

        return (
          <button
            key={char.id}
            onClick={() => onSelect(char.id)}
            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300 transform ${isSelected ? 'scale-105 ring-2 ring-current ring-offset-2 ring-offset-slate-950' : 'hover:border-slate-600'} ${colorClasses}`}
          >
            <span className="text-3xl mb-1">{displayIcon}</span>
            <span className="font-bold font-epic text-[11px] truncate w-full text-center">{displayName}</span>
          </button>
        );
      })}
    </div>
  );
};

// Custom hook to track undo history
function useUndoableState<T>(initialValue: T) {
  const [current, setCurrent] = useState<T>(initialValue);
  const [history, setHistory] = useState<T[]>([]);

  const setWithHistory = (newValue: T) => {
    if (newValue === current) return;
    setHistory(prev => [...prev, current]);
    setCurrent(newValue);
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(prevHistory => prevHistory.slice(0, -1));
    setCurrent(prev);
  };

  const canUndo = history.length > 0;
  return [current, setWithHistory, undo, canUndo] as const;
}

export default function App() {
  const [selectedCharId, setSelectedCharId] = useState<CharacterType>(CharacterType.MOP);
  const [prevCharId, setPrevCharId] = useState<CharacterType | null>(null);
  const [generationTone, setGenerationTone] = useState('epic');
  
  const [customHeroName, setCustomHeroName] = useState('');
  const [customHeroIcon, setCustomHeroIcon] = useState('');

  const [title, setTitle, undoTitle, canUndoTitle] = useUndoableState('');
  const [lyrics, setLyrics, undoLyrics, canUndoLyrics] = useUndoableState('');
  const [tempo, setTempo, undoTempo, canUndoTempo] = useUndoableState('Epic and Dramatic');
  const [extraStyle, setExtraStyle, undoExtraStyle, canUndoExtraStyle] = useUndoableState('');
  
  const [selectedSubGenres, setSelectedSubGenres] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [vocalEmotion, setVocalEmotion] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [archives, setArchives] = useState<HistoryItem[]>([]);
  const [currentMotto, setCurrentMotto] = useState(MOTTOES[0]);

  const character = useMemo(() => CHARACTERS.find(c => c.id === selectedCharId)!, [selectedCharId]);
  const activeHeroName = selectedCharId === CharacterType.CUSTOM ? (customHeroName || '自訂英雄') : character.name;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setArchives(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse archives", e);
      }
    }
    setCurrentMotto(MOTTOES[Math.floor(Math.random() * MOTTOES.length)]);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(archives));
  }, [archives]);

  const stylePrompt = useMemo(() => {
    const mainGenre = character.genres.join(', ');
    const subGenres = selectedSubGenres.join(' ');
    const instruments = selectedInstruments.join(' and ');
    const vocalStr = vocalEmotion ? `${vocalEmotion} ${character.voiceTags[0]}` : character.voiceTags[0];
    
    let prompt = `${mainGenre}, ${subGenres}, ${instruments}, ${vocalStr} Vocals, ${tempo}`;
    if (extraStyle) prompt += `, ${extraStyle}`;
    return prompt;
  }, [character, selectedSubGenres, selectedInstruments, vocalEmotion, tempo, extraStyle]);

  const finalLyricsOutput = useMemo(() => {
    if (!lyrics.trim()) return '';
    let processed = lyrics;
    if (!processed.includes('[Verse]') && !processed.includes('[Intro]')) {
       processed = `[Intro]\n${processed}`;
    }
    if (!processed.includes('[Outro]')) {
       processed += `\n[Outro]`;
    }
    return processed;
  }, [lyrics]);

  const toggleSelection = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(type);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const applyPreset = (preset: StylePreset) => {
    setTempo(preset.tempo);
    setExtraStyle(preset.extraStyle);
    setSelectedSubGenres(preset.subGenres);
    setSelectedInstruments(preset.instruments);
    setVocalEmotion(preset.vocalEmotion);
  };

  const saveToArchives = () => {
    if (!lyrics.trim()) {
      alert("請先輸入歌詞再儲存。");
      return;
    }
    const config: SongConfig = {
      title: title || "未命名史詩",
      characterId: selectedCharId,
      tempo,
      extraStyle,
      lyrics,
      selectedSubGenres,
      selectedInstruments,
      vocalEmotion,
      customName: customHeroName,
      customIcon: customHeroIcon
    };
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      config,
      preview: lyrics.slice(0, 40).replace(/\n/g, ' ') + '...'
    };
    setArchives(prev => [newItem, ...prev]);
    setCopyFeedback('saved');
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const loadFromHistory = (item: HistoryItem) => {
    const { config } = item;
    setPrevCharId(selectedCharId);
    setSelectedCharId(config.characterId);
    setTitle(config.title);
    setTempo(config.tempo);
    setExtraStyle(config.extraStyle);
    setLyrics(config.lyrics);
    setSelectedSubGenres(config.selectedSubGenres || []);
    setSelectedInstruments(config.selectedInstruments || []);
    setVocalEmotion(config.vocalEmotion || '');
    if (config.customName) setCustomHeroName(config.customName);
    if (config.customIcon) setCustomHeroIcon(config.customIcon);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentMotto(MOTTOES[Math.floor(Math.random() * MOTTOES.length)]);
  };

  const deleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("確定要刪除這筆紀錄嗎？")) {
      setArchives(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleAIAction = async (action: 'enhance' | 'suggest_style' | 'full_generate' | 'get_inspiration') => {
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let prompt = "";
      
      const charDescription = selectedCharId === CharacterType.CUSTOM ? 
        `Custom Hero named "${activeHeroName}"` : 
        `${character.name} (${character.subtitle})`;

      if (action === 'enhance') {
        prompt = `Enhance these lyrics for the character ${charDescription} in the "Mop of the King Universe". 
        METADATA RULES:
        1. All structural tags (e.g. [Verse], [Chorus]) and musical cues must be in [English Brackets].
        2. Lyrics should be in Traditional Chinese.
        Lyrics: ${lyrics}`;
      } else if (action === 'suggest_style') {
        prompt = `Based on these lyrics: "${lyrics}", suggest 3 extra English style keywords for ${charDescription}. Return only keywords separated by commas.`;
      } else if (action === 'full_generate') {
        const toneDesc = GENERATION_TONES.find(t => t.id === generationTone)?.desc;
        prompt = `You are a legendary songwriter for the "Mop of the King Universe".
        Create a complete song for the character ${charDescription} based on a random cleaning scenario.
        
        MOOD/TONE REQUIREMENT:
        The song should follow a "${toneDesc}" vibe.
        
        STRICT FORMATTING RULES:
        1. "title": Traditional Chinese.
        2. "style": English keywords that match the selected mood.
        3. "lyrics": Traditional Chinese.
        4. ALL non-lyrical content within the "lyrics" field (e.g., meta-tags like [Verse], musical cues like [Epic Drum Fill], or mood descriptions) MUST be written in English and enclosed in [Square Brackets].
        5. DO NOT force blank lines between every tag, use normal line breaks.
        6. Include structural variety: [Intro], [Verse], [Pre-Chorus], [Chorus], [Hook], [Jingle], [Bridge], [Outro].
        
        Output in JSON format with fields "title", "style", and "lyrics".`;
      } else if (action === 'get_inspiration') {
        prompt = `Provide a single epic Traditional Chinese "Spark of Inspiration" for ${charDescription}. Under 50 words.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: action === 'full_generate' ? {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              style: { type: Type.STRING },
              lyrics: { type: Type.STRING }
            },
            required: ["title", "style", "lyrics"]
          }
        } : undefined
      });

      const result = response.text;
      if (action === 'enhance' && result) setLyrics(result.trim());
      if (action === 'suggest_style' && result) setExtraStyle(result.trim());
      if (action === 'full_generate' && result) {
        const json = JSON.parse(result || '{}');
        setTitle(json.title || "AI 產出的史詩");
        setLyrics(json.lyrics || '');
        setExtraStyle(json.style || '');
      }
      if (action === 'get_inspiration' && result) {
        alert("✨ 靈感火花：\n" + result.trim());
      }
      setCurrentMotto(MOTTOES[Math.floor(Math.random() * MOTTOES.length)]);
    } catch (err) {
      console.error(err);
      alert("AI 操作失敗，請檢查網路或 API KEY。");
    } finally {
      setIsProcessing(false);
    }
  };

  const insertTag = (tag: string) => {
    const spacing = lyrics.length > 0 && !lyrics.endsWith('\n') ? '\n' : '';
    setLyrics(lyrics + spacing + tag + '\n');
  };

  const undoCharacter = () => {
    if (prevCharId) {
      const current = selectedCharId;
      setSelectedCharId(prevCharId);
      setPrevCharId(current);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-blue-600/40">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/5 blur-[120px] rounded-full"></div>
      </div>

      <header className="relative z-10 border-b border-white/5 bg-black/60 backdrop-blur-md sticky top-0 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center font-black text-white italic shadow-lg transform rotate-2">M</div>
            <div>
              <h1 className="text-xl font-black font-epic tracking-tight text-white">MOP OF THE KING</h1>
              <p className="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-bold">Suno Production Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden lg:block text-right">
                <p className="text-[10px] text-blue-400 font-epic font-bold italic tracking-widest animate-pulse">"{currentMotto}"</p>
             </div>
             <div className="flex items-center gap-2">
                <div className="flex bg-slate-900/60 p-1 rounded-lg border border-white/5 backdrop-blur-sm">
                   {GENERATION_TONES.map(tone => (
                      <button
                        key={tone.id}
                        onClick={() => setGenerationTone(tone.id)}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${generationTone === tone.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        title={tone.desc}
                      >
                         {tone.icon} {tone.label}
                      </button>
                   ))}
                </div>
                <button 
                  onClick={() => handleAIAction('full_generate')}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border border-white/10 px-6 py-2 rounded-full text-sm font-black transition-all group active:scale-95"
                >
                  <span className="group-hover:rotate-12 transition-transform">{isProcessing ? "🔮" : "🪄"}</span>
                  {isProcessing ? "生成中..." : "AI 召喚全曲"}
                </button>
             </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-md shadow-xl group relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm uppercase tracking-widest text-slate-400 font-black flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px]">1</span>
                命運英雄
              </h2>
              {prevCharId && (
                <button onClick={undoCharacter} className="text-[10px] text-slate-500 hover:text-blue-400 font-bold transition-colors">
                  還原
                </button>
              )}
            </div>
            <CharacterSelector 
              selected={selectedCharId} 
              onSelect={(id) => { setPrevCharId(selectedCharId); setSelectedCharId(id); }} 
              customName={customHeroName}
              customIcon={customHeroIcon}
            />
            {selectedCharId === CharacterType.CUSTOM && (
              <div className="mt-4 p-4 bg-slate-950/60 rounded-xl border border-blue-500/30 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-1">
                    <label className="text-[9px] text-slate-500 font-black uppercase mb-1 block">圖示</label>
                    <input 
                      type="text"
                      value={customHeroIcon}
                      onChange={(e) => setCustomHeroIcon(e.target.value)}
                      placeholder="👤"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-center outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-[9px] text-slate-500 font-black uppercase mb-1 block">英雄名號</label>
                    <input 
                      type="text"
                      value={customHeroName}
                      onChange={(e) => setCustomHeroName(e.target.value)}
                      placeholder="例如: 鋼鐵菜瓜布"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-md shadow-xl">
            <h2 className="text-sm uppercase tracking-widest text-slate-400 font-black mb-6 flex items-center gap-2">
              <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-[10px]">2</span>
              風格構築
            </h2>
            
            <div className="space-y-6">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/50">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">快速預設 (Presets)</label>
                <div className="flex flex-wrap gap-2">
                  {character.exampleStyles.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyPreset(preset)}
                      className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all active:scale-95"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 mb-2 block font-bold">次要流派</label>
                <div className="flex flex-wrap gap-2">
                  {character.subGenres.map(sg => (
                    <button
                      key={sg}
                      onClick={() => toggleSelection(sg, selectedSubGenres, setSelectedSubGenres)}
                      className={`text-xs px-3 py-1 rounded-lg border-2 transition-all font-bold ${
                        selectedSubGenres.includes(sg) 
                          ? 'border-blue-500 bg-blue-500/20 text-blue-200' 
                          : 'border-slate-800 bg-slate-800/40 text-slate-500'
                      }`}
                    >
                      {sg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 mb-2 block font-bold">核心配樂</label>
                <div className="flex flex-wrap gap-2">
                  {character.instruments.map(ins => (
                    <button
                      key={ins}
                      onClick={() => toggleSelection(ins, selectedInstruments, setSelectedInstruments)}
                      className={`text-xs px-3 py-1 rounded-lg border-2 transition-all font-bold ${
                        selectedInstruments.includes(ins) 
                          ? 'border-teal-500 bg-teal-500/20 text-teal-200' 
                          : 'border-slate-800 bg-slate-800/40 text-slate-500'
                      }`}
                    >
                      {ins}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-slate-500 font-black mb-2 block uppercase">人聲表情</label>
                  <select 
                    value={vocalEmotion}
                    onChange={(e) => setVocalEmotion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 outline-none focus:border-purple-500"
                  >
                    <option value="">(預設)</option>
                    {character.voiceTags.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-black mb-2 block uppercase">節奏速度</label>
                  <input 
                    type="text"
                    value={tempo}
                    onChange={(e) => setTempo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/50">
                <label className="text-xs text-slate-300 font-black mb-2 block">自訂補充 (Extra Style)</label>
                <input 
                  type="text"
                  value={extraStyle}
                  onChange={(e) => setExtraStyle(e.target.value)}
                  placeholder="e.g. Cyberpunk, Lo-fi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Style Prompt Preview</h3>
              {copyFeedback === 'style' && <span className="text-[10px] text-green-500 font-black">COPIED!</span>}
            </div>
            <div className="bg-black/60 p-4 rounded-xl text-xs font-mono text-blue-400 border border-white/5 break-words leading-relaxed">
              {stylePrompt}
            </div>
            <button 
              onClick={() => copyToClipboard(stylePrompt, 'style')}
              className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
              複製風格
            </button>
          </section>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <section className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col min-h-[700px] backdrop-blur-md relative shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <h2 className="text-sm uppercase tracking-widest text-slate-400 font-black flex items-center gap-2">
                <span className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-[10px]">3</span>
                史詩唱詞
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleAIAction('enhance')}
                  disabled={isProcessing || !lyrics}
                  className="text-xs bg-purple-600/30 text-purple-300 border border-purple-600/40 px-4 py-1.5 rounded-full hover:bg-purple-600/50 font-black"
                >
                  優化
                </button>
                <button 
                  onClick={() => { setTitle(''); setLyrics(''); }}
                  className="text-xs text-slate-500 hover:text-white px-4 py-1.5 border border-slate-800 rounded-full font-black"
                >
                  清空
                </button>
              </div>
            </div>

            <div className="mb-6 space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">史詩標題</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="為史詩命名..."
                className="w-full bg-slate-950/40 border-2 border-slate-800 rounded-xl px-4 py-3 text-2xl font-epic text-white outline-none focus:border-teal-500/40 transition-all font-black"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              {TAG_CATEGORIES.map((cat, i) => (
                <div key={i} className="space-y-2 p-3 bg-slate-950/40 rounded-xl border border-slate-800/60 shadow-inner">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center justify-between">
                    {cat.label}
                    <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.tags.map((t, ti) => (
                      <button
                        key={ti}
                        onClick={() => insertTag(t.tag)}
                        className="text-[10px] font-bold bg-slate-800 hover:bg-slate-600 text-slate-100 px-2 py-1 rounded-md border border-slate-700 transition-all"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex-1 flex flex-col relative">
              <textarea 
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="在此輸入歌詞..."
                className="flex-1 bg-black/50 border-2 border-slate-800 rounded-2xl p-6 text-lg font-serif italic leading-relaxed focus:border-teal-500/20 outline-none resize-none placeholder:text-slate-800 transition-all min-h-[400px]"
              />
            </div>
          </section>

          <section className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-white/10 p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
            <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-8">
              <div className="flex-1 text-center xl:text-left">
                <h3 className="text-2xl font-black font-epic text-white mb-2 tracking-tighter uppercase truncate max-w-[300px]">{title || "Untitled Epic"}</h3>
                <p className="text-sm text-slate-400 italic font-bold">"Destiny is written in fiber."</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={saveToArchives}
                  className="px-6 py-4 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl font-black text-sm transition-all flex items-center justify-center gap-3 border border-slate-600 active:scale-95 shadow-lg"
                >
                  存檔
                </button>
                <button 
                  onClick={() => copyToClipboard(finalLyricsOutput, 'lyrics')}
                  disabled={!finalLyricsOutput}
                  className="px-12 py-5 bg-white text-black rounded-xl font-black text-xl transition-all shadow-xl hover:shadow-white/20 active:scale-95 disabled:bg-slate-800 flex items-center justify-center gap-4"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                  複製歌詞
                </button>
              </div>
            </div>
            {copyFeedback === 'lyrics' && <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-500 z-20"><span className="text-white font-black text-4xl font-epic">COPIED!</span></div>}
          </section>

          <section className="bg-slate-900/30 border border-slate-800/40 rounded-[2rem] p-8 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black font-epic text-white tracking-widest mb-1">STUDIO ARCHIVES</h2>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Saved drafts and epics</p>
              </div>
              <div className="px-4 py-1.5 rounded-full bg-slate-800/90 text-[10px] font-black text-slate-300 border border-slate-700 shadow-lg">
                {archives.length} ITEMS
              </div>
            </div>

            {archives.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-slate-800/50 rounded-2xl bg-black/30">
                <p className="text-slate-600 font-black italic text-sm">No archives yet...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {archives.map((item) => {
                  const char = CHARACTERS.find(c => c.id === item.config.characterId);
                  const displayIcon = item.config.characterId === CharacterType.CUSTOM ? (item.config.customIcon || char?.icon) : char?.icon;
                  const displayName = item.config.characterId === CharacterType.CUSTOM ? (item.config.customName || char?.name) : char?.name;
                  
                  return (
                    <div 
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="group relative bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-500 p-6 rounded-2xl cursor-pointer transition-all shadow-md"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{displayIcon}</span>
                          <div>
                            <h4 className="text-sm font-black text-white font-epic truncate max-w-[150px]">{item.config.title || displayName}</h4>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <button onClick={(e) => deleteFromHistory(item.id, e)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-500 transition-all rounded-full hover:bg-red-500/10">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 italic font-medium">"{item.preview}"</p>
                      <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-center opacity-40 group-hover:opacity-100">
                        <span className="text-[9px] font-black text-slate-500 uppercase">{item.config.selectedSubGenres?.[0] || 'ORIGINAL'}</span>
                        <span className="text-[9px] text-blue-500 font-black">LOAD →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="relative z-10 max-w-7xl mx-auto p-12 text-center text-slate-600 text-[10px] uppercase tracking-[0.4em] font-black opacity-30">
        <p className="mb-2">© 2024 THE MOP OF THE KING UNIVERSE - AI HANDBOOK COMPLIANT</p>
      </footer>
    </div>
  );
}
