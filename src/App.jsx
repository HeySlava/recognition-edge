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
  
  // Session Stats
  const [sessionStatus, setSessionStatus] = useState('active'); // 'active' | 'results'
  const [edgeStats, setEdgeStats] = useState({});
  const [lastShownAt, setLastShownAt] = useState(Date.now());
  
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
    setLastShownAt(Date.now());
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
    // Ignore keypress if settings modal is open, in results mode, or typing in input
    if (isSettingsOpen || sessionStatus === 'results' || e.target.tagName === 'INPUT') return;
    
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
      const timeTaken = Date.now() - lastShownAt;
      setEdgeStats(prev => {
        const current = prev[currentEdge.id] || { count: 0, totalTime: 0 };
        return {
          ...prev,
          [currentEdge.id]: {
            count: current.count + 1,
            totalTime: current.totalTime + timeTaken
          }
        };
      });

      setStreak(prev => prev + 1);
      setTotalCorrect(prev => prev + 1);
      showFeedback('Верно!', 'correct');
      selectRandomEdge();
    } else {
      // Incorrect!
      setStreak(0);
      showFeedback(`Ошибка! Правильно: ${correctKey}`, 'incorrect');
    }
  }, [currentEdge, mapping, isSettingsOpen, sessionStatus, lastShownAt, selectRandomEdge]);

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

  const startNewSession = () => {
    setEdgeStats({});
    setStreak(0);
    setTotalCorrect(0);
    setTotalAnswers(0);
    setSessionStatus('active');
    selectRandomEdge();
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

        <div className="controls" style={{ display: 'flex', gap: '0.5rem' }}>
          {sessionStatus === 'active' && (
            <button onClick={() => setSessionStatus('results')} style={{ borderColor: 'var(--accent)', color: '#60a5fa' }}>
              Завершить сессию
            </button>
          )}
          <button onClick={() => setIsSettingsOpen(true)}>Настройки</button>
        </div>
      </header>

      {sessionStatus === 'results' ? (
        <main className="main-content" style={{ justifyContent: 'flex-start', overflowY: 'auto' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '800px' }}>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Итоги сессии</h2>
            
            <div className="results-grid">
              {Object.entries(edgeStats).sort((a, b) => b[1].count - a[1].count).map(([id, stats]) => {
                const edge = EDGES.find(e => e.id === id);
                if (!edge) return null;
                const avgTime = (stats.totalTime / stats.count / 1000).toFixed(2);
                
                let timeColor = 'var(--success)';
                if (avgTime > 3) timeColor = 'var(--error)';
                else if (avgTime > 2) timeColor = '#f97316'; // orange

                return (
                  <div key={id} className="result-card glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="edge-mini">
                      <div className="edge-mini-primary" style={{ backgroundColor: COLORS[edge.face1] }}></div>
                      <div className="edge-mini-secondary" style={{ backgroundColor: COLORS[edge.face2] }}></div>
                    </div>
                    <div className="result-details" style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{id}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Выпало раз: {stats.count}</div>
                      <div style={{ fontSize: '1rem', color: timeColor, fontWeight: 600 }}>
                        {avgTime}s
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {Object.keys(edgeStats).length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>За эту сессию вы не угадали ни одного ребра.</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
              <button 
                onClick={startNewSession}
                className="preset-btn"
                style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}
              >
                Начать новую сессию
              </button>
            </div>
          </div>
        </main>
      ) : (
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
      )}

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
