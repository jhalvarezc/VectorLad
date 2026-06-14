
import React, { useState, useCallback, useRef, useEffect } from 'react';
import VectorCanvas from './components/VectorCanvas';
import { VectorData, AIExplanation, ChatMessage, AngleVisual, DimensionMode } from './types';
import { startExploration, askFollowUp } from './services/geminiService';

const App: React.FC = () => {
  const [dimensionMode, setDimensionMode] = useState<DimensionMode>('3D');
  const [inputTab, setInputTab] = useState<'cartesian' | 'polar'>('cartesian');
  const [vectors, setVectors] = useState<VectorData[]>([
    { id: '1', x: 3, y: 4, z: 2, color: '#3b82f6', label: 'A' },
    { id: '2', x: -2, y: 5, z: 1, color: '#10b981', label: 'B' }
  ]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [angleVisual, setAngleVisual] = useState<AngleVisual | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Usamos un string para el input del escalar para permitir escribir "-" sin problemas
  const [scalarInput, setScalarInput] = useState('2');
  
  // Cartesian State
  const [newX, setNewX] = useState(2);
  const [newY, setNewY] = useState(2);
  const [newZ, setNewZ] = useState(2);
  
  // Polar/Spherical State
  const [mag, setMag] = useState(5);
  const [azimuth, setAzimuth] = useState(45); // Degrees
  const [elevation, setElevation] = useState(0); // Degrees
  
  const [newColor, setNewColor] = useState('#8b5cf6');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => {
    if (dimensionMode === '2D') {
      setVectors(prev => prev.map(v => ({ ...v, z: 0 })));
      setNewZ(0);
      setElevation(0);
    }
  }, [dimensionMode]);

  const addVector = useCallback(() => {
    const nextLabel = String.fromCharCode(65 + (vectors.length % 26));
    let finalX, finalY, finalZ;

    if (inputTab === 'cartesian') {
      finalX = newX;
      finalY = newY;
      finalZ = dimensionMode === '2D' ? 0 : newZ;
    } else {
      const aziRad = (azimuth * Math.PI) / 180;
      const elevRad = (elevation * Math.PI) / 180;
      if (dimensionMode === '3D') {
        finalX = mag * Math.cos(elevRad) * Math.cos(aziRad);
        finalY = mag * Math.cos(elevRad) * Math.sin(aziRad);
        finalZ = mag * Math.sin(elevRad);
      } else {
        finalX = mag * Math.cos(aziRad);
        finalY = mag * Math.sin(aziRad);
        finalZ = 0;
      }
    }

    const v: VectorData = {
      id: Date.now().toString(),
      x: Number(finalX.toFixed(2)),
      y: Number(finalY.toFixed(2)),
      z: Number(finalZ.toFixed(2)),
      color: newColor,
      label: nextLabel
    };
    setVectors(prev => [...prev, v]);
  }, [vectors, newX, newY, newZ, mag, azimuth, elevation, newColor, dimensionMode, inputTab]);

  const updateVectorPos = useCallback((id: string, x: number, y: number, z: number) => {
    setVectors(prev => prev.map(v => v.id === id ? { ...v, x, y, z } : v));
  }, []);

  const deleteVector = (id: string) => {
    setVectors(prev => prev.filter(v => v.id !== id));
    setSelectedIds(prev => prev.filter(i => i !== id));
    if (angleVisual?.v1.id === id || angleVisual?.v2.id === id) setAngleVisual(null);
  };

  const handleSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const normalizeSelected = async () => {
    if (selectedIds.length === 0) return;
    setAiLoading(true);
    setChatHistory([]);
    setAngleVisual(null);
    const updatedVectors = [...vectors];
    const normalizedList: VectorData[] = [];
    selectedIds.forEach(id => {
      const idx = updatedVectors.findIndex(v => v.id === id);
      if (idx !== -1) {
        const v = updatedVectors[idx];
        const mag = Math.sqrt(v.x**2 + v.y**2 + v.z**2);
        if (mag > 0) {
          const res: VectorData = {
            ...v,
            x: Number((v.x / mag).toFixed(4)),
            y: Number((v.y / mag).toFixed(4)),
            z: Number((v.z / mag).toFixed(4)),
            label: v.label.includes('̂') ? v.label : `${v.label}̂`
          };
          updatedVectors[idx] = res;
          normalizedList.push(res);
        }
      }
    });
    setVectors(updatedVectors);
    try {
      if (normalizedList.length > 0) {
        const target = normalizedList[0];
        const expl = await startExploration(target, target, 'normalización', target);
        setExplanation(expl);
        setChatHistory([{ role: 'model', text: `🎯 **${expl.title}**\n\n${expl.explanation}\n\n🌍 **Uso Real:** ${expl.physicalInterpretation}` }]);
      }
    } catch (err) { console.error(err); } finally { setAiLoading(false); }
  };

  const performOperation = async (op: 'sum' | 'sub' | 'cross' | 'dot' | 'angle' | 'projection' | 'distance' | 'scalar') => {
    if (selectedIds.length === 0) return;
    if (op !== 'scalar' && selectedIds.length < 2) return;
    const v1 = vectors.find(v => v.id === selectedIds[0])!;
    const v2 = vectors.find(v => v.id === selectedIds[1]) || v1;
    let result: VectorData | number;
    let opName = '';
    setAngleVisual(null);

    // Parseamos el factor actual del input de texto
    const currentFactor = parseFloat(scalarInput) || 0;

    if (op === 'sum') {
      opName = 'suma vectorial';
      result = { id: Date.now().toString(), x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z, color: '#f59e0b', label: `${v1.label}+${v2.label}`, isResult: true };
      setVectors(prev => [...prev, result as VectorData]);
    } else if (op === 'sub') {
      opName = 'resta vectorial';
      result = { id: Date.now().toString(), x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z, color: '#f43f5e', label: `${v1.label}-${v2.label}`, isResult: true };
      setVectors(prev => [...prev, result as VectorData]);
    } else if (op === 'cross') {
      opName = 'producto cruz';
      result = { id: Date.now().toString(), x: v1.y * v2.z - v1.z * v2.y, y: v1.z * v2.x - v1.x * v2.z, z: v1.x * v2.y - v1.y * v2.x, color: '#ec4899', label: `${v1.label}×${v2.label}`, isResult: true };
      setVectors(prev => [...prev, result as VectorData]);
    } else if (op === 'dot') {
      opName = 'producto punto';
      result = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    } else if (op === 'angle') {
      opName = 'ángulo';
      const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
      const m1 = Math.sqrt(v1.x**2 + v1.y**2 + v1.z**2);
      const m2 = Math.sqrt(v2.x**2 + v2.y**2 + v2.z**2);
      const cosTheta = Math.max(-1, Math.min(1, dot / (m1 * m2)));
      result = (Math.acos(cosTheta) * 180) / Math.PI;
      setAngleVisual({ v1, v2, angle: result });
    } else if (op === 'projection') {
      opName = 'proyección de A sobre B';
      const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
      const magBSq = v2.x**2 + v2.y**2 + v2.z**2;
      const factor = magBSq === 0 ? 0 : dot / magBSq;
      result = { id: Date.now().toString(), x: v2.x * factor, y: v2.y * factor, z: v2.z * factor, color: '#06b6d4', label: `proj_${v2.label}${v1.label}`, isResult: true };
      setVectors(prev => [...prev, result as VectorData]);
    } else if (op === 'distance') {
      opName = 'distancia entre puntas';
      result = Math.sqrt((v2.x - v1.x)**2 + (v2.y - v1.y)**2 + (v2.z - v1.z)**2);
    } else {
      opName = 'multiplicación por escalar';
      result = { id: Date.now().toString(), x: v1.x * currentFactor, y: v1.y * currentFactor, z: v1.z * currentFactor, color: '#8b5cf6', label: `${currentFactor}${v1.label}`, isResult: true };
      setVectors(prev => [...prev, result as VectorData]);
    }
    setAiLoading(true);
    setChatHistory([]);
    try {
      const expl = await startExploration(v1, v2, opName, result);
      setExplanation(expl);
      const resultValue = typeof result === 'number' ? `**Valor:** ${result.toFixed(3)}${op === 'angle' ? '°' : ''}` : '';
      setChatHistory([{ role: 'model', text: `✨ **${expl.title}**\n\n${expl.explanation}\n\n${resultValue}\n\n🚀 **Física:** ${expl.physicalInterpretation}` }]);
    } catch (err) { console.error(err); } finally { setAiLoading(false); }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim() || isAsking) return;
    const q = userQuestion; setUserQuestion('');
    setChatHistory(prev => [...prev, { role: 'user', text: q }]);
    setIsAsking(true);
    try {
      const answer = await askFollowUp(q);
      setChatHistory(prev => [...prev, { role: 'model', text: `💡 ${answer}` }]);
    } catch (err) { setChatHistory(prev => [...prev, { role: 'model', text: "Error de conexión." }]); } finally { setIsAsking(false); }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden text-slate-200 bg-slate-950">
      <VectorCanvas vectors={vectors} angleVisual={angleVisual} dimensionMode={dimensionMode} onUpdateVector={updateVectorPos} />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 pointer-events-none flex justify-between items-start z-40">
        <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-2xl">
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">VectorLab 3.0</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Geometría Avanzada</p>
        </div>
        <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-lg flex gap-1">
          <button onClick={() => setDimensionMode('2D')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${dimensionMode === '2D' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}>R2</button>
          <button onClick={() => setDimensionMode('3D')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${dimensionMode === '3D' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}>R3</button>
        </div>
      </div>

      {/* Left Panel: Creator & Operations */}
      <div className="absolute top-28 left-6 w-72 flex flex-col gap-4 z-40 max-h-[calc(100vh-14rem)] overflow-y-auto no-scrollbar pb-10">
        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border border-slate-700 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Añadir Vector</h2>
            <div className="flex bg-slate-800 rounded-lg p-0.5">
               <button onClick={() => setInputTab('cartesian')} aria-label="Modo cartesiano" title="Modo cartesiano" className={`p-1 rounded-md transition-all ${inputTab === 'cartesian' ? 'bg-blue-600 shadow-md' : 'hover:bg-slate-700 opacity-50'}`}>
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18"/><path d="M12 3v18"/></svg>
               </button>
               <button onClick={() => setInputTab('polar')} aria-label="Modo polar" title="Modo polar" className={`p-1 rounded-md transition-all ${inputTab === 'polar' ? 'bg-blue-600 shadow-md' : 'hover:bg-slate-700 opacity-50'}`}>
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m12 12 5-5"/></svg>
               </button>
            </div>
          </div>

          {inputTab === 'cartesian' ? (
            <div className="grid grid-cols-3 gap-2 mb-4 animate-in fade-in zoom-in duration-300">
              {['X', 'Y', 'Z'].map((axis) => (
                (axis !== 'Z' || dimensionMode === '3D') && (
                  <div key={axis}>
                    <label htmlFor={`coord-${axis}`} className="block text-[8px] text-center text-slate-500 uppercase mb-1">{axis}</label>
                    <input 
                      id={`coord-${axis}`}
                      type="number" 
                      value={axis === 'X' ? newX : axis === 'Y' ? newY : newZ} 
                      onChange={e => {
                        const val = Number(e.target.value);
                        if (axis === 'X') setNewX(val);
                        else if (axis === 'Y') setNewY(val);
                        else setNewZ(val);
                      }} 
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-1.5 text-center text-xs outline-none focus:border-blue-500 transition-all" 
                    />
                  </div>
                )
              ))}
            </div>
          ) : (
            <div className="space-y-3 mb-4 animate-in fade-in zoom-in duration-300">
              <div>
                <label htmlFor="mag-input" className="block text-[8px] text-slate-500 uppercase mb-1">Magnitud (r): {mag}</label>
                <input id="mag-input" type="range" min="0" max="20" step="0.1" value={mag} onChange={e => setMag(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              </div>
              <div>
                <label htmlFor="azimuth-input" className="block text-[8px] text-slate-500 uppercase mb-1">Azimut (θ): {azimuth}°</label>
                <input id="azimuth-input" type="range" min="0" max="360" value={azimuth} onChange={e => setAzimuth(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              </div>
              {dimensionMode === '3D' && (
                <div>
                  <label htmlFor="elevation-input" className="block text-[8px] text-slate-500 uppercase mb-1">Elevación (φ): {elevation}°</label>
                  <input id="elevation-input" type="range" min="-90" max="90" value={elevation} onChange={e => setElevation(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <label htmlFor="color-picker-input" className="sr-only">Color del vector</label>
            <input id="color-picker-input" aria-label="Color del vector" type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer overflow-hidden shadow-inner" />
            <button onClick={addVector} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-2 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-95">Crear</button>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border border-slate-700 shadow-2xl space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Operaciones</h2>
          
          <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50 shadow-inner group">
            <div className="flex justify-between items-center mb-3">
               <label htmlFor="scalar-input" className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-focus-within:text-purple-400 transition-colors">Factor Escalar (k)</label>
               <input 
                  id="scalar-input"
                  type="text" 
                  value={scalarInput} 
                  onChange={e => setScalarInput(e.target.value)}
                  placeholder="Ej: -2.5"
                  className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-right text-purple-400 font-mono font-bold outline-none focus:border-purple-500 shadow-sm"
               />
            </div>
            <input 
               aria-label="Factor Escalar"
               type="range" 
               min="-10" 
               max="10" 
               step="0.1" 
               value={parseFloat(scalarInput) || 0} 
               onChange={e => setScalarInput(e.target.value)} 
               className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 mb-4" 
            />
            <button 
               disabled={selectedIds.length === 0} 
               onClick={() => performOperation('scalar')} 
               className="w-full bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 py-2.5 rounded-xl text-[10px] font-black border border-purple-600/30 transition-all uppercase tracking-widest shadow-lg active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
            >
              Multiplicar {scalarInput || 'k'} · Vector
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button disabled={selectedIds.length < 2} onClick={() => performOperation('sum')} className="bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-[9px] py-2.5 rounded-xl font-black border border-slate-700 transition-all shadow-sm">SUMA (+)</button>
            <button disabled={selectedIds.length < 2} onClick={() => performOperation('sub')} className="bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-[9px] py-2.5 rounded-xl font-black border border-slate-700 transition-all shadow-sm">RESTA (-)</button>
            <button disabled={selectedIds.length < 2 || dimensionMode === '2D'} onClick={() => performOperation('cross')} className="bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-[9px] py-2.5 rounded-xl font-black border border-slate-700 transition-all shadow-sm">CRUZ (×)</button>
            <button disabled={selectedIds.length < 2} onClick={() => performOperation('dot')} className="bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-[9px] py-2.5 rounded-xl font-black border border-slate-700 transition-all shadow-sm">PUNTO (•)</button>
            <button disabled={selectedIds.length < 2} onClick={() => performOperation('projection')} className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 disabled:opacity-20 text-[9px] py-2.5 rounded-xl font-black border border-cyan-600/20 transition-all uppercase tracking-tighter">Proy (A|B)</button>
            <button disabled={selectedIds.length < 2} onClick={() => performOperation('distance')} className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 disabled:opacity-20 text-[9px] py-2.5 rounded-xl font-black border border-indigo-600/20 transition-all uppercase tracking-tighter">Dist (A,B)</button>
            <button disabled={selectedIds.length < 2} onClick={() => performOperation('angle')} className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 disabled:opacity-20 text-[9px] py-2.5 rounded-xl font-black border border-amber-600/20 col-span-2 transition-all shadow-sm uppercase tracking-widest">Ángulo (θ)</button>
            <button disabled={selectedIds.length === 0} onClick={normalizeSelected} className="col-span-2 bg-emerald-600/80 hover:bg-emerald-500 text-white text-[10px] py-3 rounded-xl font-black border border-emerald-400/30 transition-all active:scale-95 uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20">Normalizar</button>
          </div>
          <button onClick={() => { setVectors([]); setSelectedIds([]); setAngleVisual(null); setExplanation(null); }} className="w-full text-[8px] text-red-400/50 hover:text-red-400 font-bold uppercase tracking-[0.3em] pt-2 transition-colors">Limpiar Escena</button>
        </div>
      </div>

      {/* BOTTOM DOCK */}
      <div className="absolute bottom-6 left-0 right-0 px-6 z-50 flex justify-center pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-3 rounded-[32px] shadow-2xl flex gap-3 max-w-[90vw] overflow-x-auto scroll-custom no-scrollbar">
          {vectors.map((v) => {
            const selectionIndex = selectedIds.indexOf(v.id);
            const isSelected = selectionIndex !== -1;
            return (
              <div key={v.id} onClick={() => handleSelection(v.id)} className={`relative min-w-[110px] p-3 rounded-[24px] border cursor-pointer transition-all duration-300 flex flex-col items-center gap-1.5 group ${isSelected ? 'bg-slate-800 border-blue-500 -translate-y-2 shadow-xl' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}`} style={isSelected ? { borderColor: v.color, boxShadow: `0 10px 30px ${v.color}22` } : {}}>
                <button aria-label="Eliminar vector" title="Eliminar vector" onClick={(e) => { e.stopPropagation(); deleteVector(v.id); }} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[8px] z-10">✕</button>
                {isSelected && <div className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full flex items-center justify-center font-black text-[9px] text-white shadow-lg z-10 animate-in zoom-in" style={{ backgroundColor: v.color }}>{selectionIndex + 1}</div>}
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm" style={{ backgroundColor: `${v.color}22`, color: v.color }}>{v.label}</div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-mono font-bold text-white/80">{v.x}, {v.y}{dimensionMode === '3D' ? `, ${v.z}` : ''}</span>
                  <span className="text-[7px] text-slate-500 uppercase tracking-tighter">Mag: {Math.sqrt(v.x**2 + v.y**2 + v.z**2).toFixed(1)}</span>
                </div>
              </div>
            );
          })}
          {vectors.length === 0 && <div className="px-8 py-4 text-[10px] text-slate-500 uppercase font-black tracking-widest opacity-50 italic">Escena Vacía</div>}
        </div>
      </div>

      {/* Right Panel: AI Tutor */}
      <div className="absolute top-28 right-6 w-80 z-40 flex flex-col gap-4 max-h-[calc(100vh-14rem)]">
        {(aiLoading || explanation) && (
          <div className="bg-slate-900/95 backdrop-blur-2xl border border-slate-700 rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right flex-1 min-h-0">
            {aiLoading ? (
              <div className="flex flex-col items-center py-12 gap-4">
                <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-slate-400 font-bold animate-pulse text-[9px] uppercase tracking-widest">Calculando con IA...</p>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 text-sm">🤖</div>
                    <h2 className="text-[10px] font-black text-white uppercase tracking-wider">Tutor Geométrico</h2>
                  </div>
                  <button aria-label="Cerrar tutor" title="Cerrar tutor" onClick={() => { setExplanation(null); setChatHistory([]); }} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/20 scroll-custom min-h-0">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                      <div className={`max-w-[90%] p-3 rounded-2xl whitespace-pre-wrap text-[11px] font-medium leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700/50'}`}>{msg.text}</div>
                    </div>
                  ))}
                  {isAsking && <div className="flex justify-start"><div className="bg-slate-800 p-2 rounded-2xl flex gap-1 border border-slate-700/50"><div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" /><div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-75" /><div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-150" /></div></div>}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleAskQuestion} className="p-3 border-t border-slate-800 bg-slate-900/80 flex gap-2">
                  <label htmlFor="chat-input" className="sr-only">Tu pregunta</label>
                  <input id="chat-input" aria-label="Tu pregunta" type="text" value={userQuestion} onChange={e => setUserQuestion(e.target.value)} placeholder="¿Por qué se estira el vector?" className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-[10px] outline-none focus:border-blue-500 transition-colors placeholder:opacity-30" />
                  <button aria-label="Enviar pregunta" title="Enviar pregunta" disabled={!userQuestion.trim() || isAsking} type="submit" className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2 rounded-xl transition-all active:scale-90"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg></button>
                </form>
              </>
            )}
          </div>
        )}
      </div>

      {/* Axis Helper Legend */}
      <div className="absolute bottom-32 left-6 pointer-events-none z-10">
        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 flex gap-3 shadow-lg pointer-events-auto text-[8px] font-black text-slate-500 uppercase tracking-widest">
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500" />X</div>
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500" />Y</div>
          {dimensionMode === '3D' && <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" />Z</div>}
        </div>
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .scroll-custom::-webkit-scrollbar { height: 4px; width: 4px; }
        .scroll-custom::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
