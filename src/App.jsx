import React, { useState, useEffect, useCallback, useRef } from 'react';
import { EDGES, DEFAULT_MAPPINGS, COLORS } from './constants/cube';

function App() {
  const [mapping, setMapping] = useState(DEFAULT_MAPPINGS.EN);
  const [currentEdge, setCurrentEdge] = useState(null);
  const [excludeBuffer, setExcludeBuffer] = useState(true);
  
  // Stats
  const [streak, setStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  
  // UI State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '', visible: false });
  
  const appContainerRef = useRef(null);

  const getAvailableEdges = useCallback(() => {
    return EDGES.filter(edge => {
      if (excludeBuffer && edge.isBufferCandidate) return false;
      return true;
    });
  }, [excludeBuffer]);

  const selectRandomEdge = useCallback(() => {
    const available = getAvailableEdges();
    const randomIndex = Math.floor(Math.random() * available.length);
    const newEdge = available[randomIndex];
    setCurrentEdge(newEdge);
  }, [getAvailableEdges]);

  // Initial load or when buffer setting changes
  useEffect(() => {
    selectRandomEdge();
  }, [selectRandomEdge, excludeBuffer]);

  const showFeedback = (text, type) => {
    setFeedback({ text, type, visible: true });
    
    // Add document class for flash animation
    document.body.classList.add(`flash-${type}`);
    
    setTimeout(() => {
      setFeedback(prev => ({ ...prev, visible: false }));
      document.body.classList.remove(`flash-${type}`);
    }, 600);
  };

  const handleKeyPress = useCallback((e) => {
    // Ignore keypress if settings modal is open or typing in input
    if (isSettingsOpen || e.target.tagName === 'INPUT') return;
    
    // Some keys shouldn't trigger grading (Shift, Ctrl, etc.)
    if (e.key.length > 1) return;

    if (!currentEdge) return;

    const pressedKey = e.key.toUpperCase();
    const correctKey = mapping[currentEdge.id]?.toUpperCase();

    // Mapping might not have value (empty string)
    if (!correctKey) {
      showFeedback(`Не назначена буква для ${currentEdge.id}`, 'incorrect');
      return;
    }

    setTotalAnswers(prev => prev + 1);

    if (pressedKey.toUpperCase() === correctKey.toUpperCase()) {
      // Correct!
      setStreak(prev => prev + 1);
      setTotalCorrect(prev => prev + 1);
      showFeedback('Верно!', 'correct');
      selectRandomEdge();
    } else {
      // Incorrect!
      setStreak(0);
      showFeedback(`Ошибка! Правильно: ${correctKey}`, 'incorrect');
    }
  }, [currentEdge, mapping, isSettingsOpen, selectRandomEdge]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const updateMapping = (id, value) => {
    setMapping(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const loadPreset = (presetName) => {
    setMapping(DEFAULT_MAPPINGS[presetName]);
  };

  const accuracy = totalAnswers === 0 ? 0 : Math.round((totalCorrect / totalAnswers) * 100);

  return (
    <div className="app-container" ref={appContainerRef}>
      <header>
        <div className="title">
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Edge Recognition</h1>
        </div>
        
        <div className="stats" style={{ color: 'var(--text-main)' }}>
          <div className="stat-item">
            <span className="stat-label">Стрик</span>
            <span className="stat-value">{streak}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Точность</span>
            <span className="stat-value">{accuracy}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Всего</span>
            <span className="stat-value">{totalCorrect}</span>
          </div>
        </div>

        <div className="controls">
          <button onClick={() => setIsSettingsOpen(true)}>Настройки</button>
        </div>
      </header>

      <main className="main-content">
        <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {currentEdge && (
            <div className="edge-container">
              {/* Primary Face (Top logic is we show primary larger) */}
              <div 
                className="edge-face primary" 
                style={{ backgroundColor: COLORS[currentEdge.face1] }}
                title={`Основной: ${currentEdge.face1}`}
              ></div>
              {/* Secondary Face (Tilted/depth logic) */}
              <div 
                className="edge-face secondary" 
                style={{ backgroundColor: COLORS[currentEdge.face2] }}
                title={`Вторичный: ${currentEdge.face2}`}
              ></div>
            </div>
          )}

          <div className={`feedback-text ${feedback.type} ${feedback.visible ? 'show' : ''}`}>
            {feedback.text}
          </div>

          <div className="instruction">
            Нажмите букву клавиатуры, соответствующую ребру
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <div className={`modal-overlay ${isSettingsOpen ? 'open' : ''} glass-panel`} style={{ padding: 0, borderRadius: 0, border: 'none' }}>
        <div className="modal-content glass-panel" style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
          <div className="modal-header">
            <h2>Настройки тренажера</h2>
            <button className="close-btn" onClick={() => setIsSettingsOpen(false)}>&times;</button>
          </div>
          
          <div style={{ overflowY: 'auto', paddingRight: '1rem', flex: 1 }}>
            <div className="settings-group">
              <div className="toggle-group">
                <div className="toggle-label">
                  <span className="toggle-title">Исключить Буфер (UR/RU)</span>
                  <span className="toggle-desc">Обычно буфер не тренируют. Стандартный буфер: Бело-Красный.</span>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={excludeBuffer} onChange={(e) => setExcludeBuffer(e.target.checked)} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-group">
              <h3>Раскладка азбуки</h3>
              <p>Настройте буквы для каждого ребра.</p>
              
              <div className="preset-buttons">
                <button className="preset-btn" onClick={() => loadPreset('RU')}>Русская (АБВГ...)</button>
                <button className="preset-btn" onClick={() => loadPreset('EN')}>Латиница (Speffz)</button>
              </div>

              <div className="mapping-grid">
                {EDGES.map(edge => (
                  <div className="mapping-item" key={edge.id} style={{
                    backgroundColor: COLORS[edge.face1] + '33',
                    borderColor: excludeBuffer && edge.isBufferCandidate ? 'rgba(239, 68, 68, 0.8)' : COLORS[edge.face1] + '80',
                    opacity: excludeBuffer && edge.isBufferCandidate ? 0.4 : 1
                  }}>
                    <div className="mapping-label" style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: 'white' }}>
                      {edge.id}
                    </div>
                    <input 
                      className="mapping-input"
                      value={mapping[edge.id] || ''}
                      onChange={(e) => updateMapping(edge.id, e.target.value)}
                      maxLength={1}
                      disabled={excludeBuffer && edge.isBufferCandidate}
                      style={{ 
                        borderBottom: `2px solid ${COLORS[edge.face1]}`,
                        textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
              Все изменения сохраняются автоматически. Нажмите на крестик, чтобы вернуться.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default App;
