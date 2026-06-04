import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { scoreInventory } from '../engine/aiScoring';
import { assembleAutoItineraries } from '../engine/autoAssemble';
import { ALL_INVENTORY } from '../data/inventory';

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

export default function AutoBuildLoading() {
  const navigate = useNavigate();
  const {
    constraintObject,
    scoredInventory,
    setScoredInventory,
    setAutoItineraries,
  } = useApp();

  const [completed, setCompleted] = useState([]); // indices of done steps
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState(null);

  const hasCachedScores = !!scoredInventory;

  const STEPS = [
    { emoji: '👤', label: 'Reading your travel profile & preferences' },
    {
      emoji: hasCachedScores ? '⚡' : '🤖',
      label: hasCachedScores
        ? 'Using cached AI scores (already scored)'
        : 'AI scoring 47 Thailand options for you',
    },
    { emoji: '🗺️', label: 'Crafting 3 personalised itineraries' },
    { emoji: '🪙', label: 'Calculating coins & savings' },
  ];

  useEffect(() => {
    if (!constraintObject) {
      navigate('/summary');
      return;
    }

    async function run() {
      try {
        // Step 0: Profile
        setActiveStep(0);
        await delay(650);
        setCompleted(c => [...c, 0]);

        // Step 1: AI scoring
        setActiveStep(1);
        let scores = scoredInventory;
        if (!scores) {
          scores = await scoreInventory(constraintObject, ALL_INVENTORY);
          setScoredInventory(scores);
        } else {
          await delay(550);
        }
        setCompleted(c => [...c, 1]);

        // Step 2: Assembly
        setActiveStep(2);
        await delay(750);
        const itins = assembleAutoItineraries(constraintObject, scores);
        setAutoItineraries(itins);
        setCompleted(c => [...c, 2]);

        // Step 3: Coins
        setActiveStep(3);
        await delay(400);
        setCompleted(c => [...c, 3]);

        await delay(350);
        navigate('/auto-compare');
      } catch (err) {
        setError(err.message || 'Something went wrong');
      }
    }

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={s.page}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={s.shell}>
        {/* Globe animation */}
        <div style={s.globeWrap}>
          <div style={s.globeRing} />
          <div style={s.globe}>🌏</div>
        </div>

        <div style={s.title}>Building your Thailand trip</div>
        <div style={s.subtitle}>
          AI is assembling 3 personalised options based on your profile
        </div>

        <div style={s.stepList}>
          {STEPS.map((step, i) => {
            const done = completed.includes(i);
            const active = activeStep === i && !done;
            const future = i > activeStep;
            return (
              <div
                key={i}
                style={{
                  ...s.stepRow,
                  opacity: future ? 0.3 : 1,
                  animation: future ? 'none' : 'fadeUp 0.3s ease both',
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                <div
                  style={{
                    ...s.stepIcon,
                    background: done
                      ? '#3F9A4E'
                      : active
                      ? '#E8491D'
                      : '#e5e7eb',
                    color: done || active ? 'white' : '#9ca3af',
                    animation: active ? 'pulse 1.2s ease infinite' : 'none',
                  }}
                >
                  {done ? '✓' : step.emoji}
                </div>
                <span
                  style={{
                    ...s.stepLabel,
                    color: done ? '#3F9A4E' : active ? '#C53B14' : '#6b7280',
                    fontWeight: done || active ? 600 : 400,
                  }}
                >
                  {step.label}
                  {active && <span style={s.ellipsis}>…</span>}
                  {done && i === 1 && hasCachedScores && (
                    <span style={s.cachedBadge}>cached</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div style={s.progressTrack}>
          <div
            style={{
              ...s.progressFill,
              width: `${(completed.length / STEPS.length) * 100}%`,
            }}
          />
        </div>
        <div style={s.progressLabel}>
          {completed.length}/{STEPS.length} steps complete
        </div>

        {/* Error state */}
        {error && (
          <div style={s.errorBox}>
            <div style={s.errorTitle}>⚠️ Something went wrong</div>
            <div style={s.errorMsg}>{error}</div>
            {error.includes('API key') && (
              <div style={s.errorHint}>
                Add your OpenAI key to <code>.env.local</code> and restart the dev server.
              </div>
            )}
            <button style={s.backBtn} onClick={() => navigate('/summary')}>
              ← Back to summary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100dvh',
    background: 'linear-gradient(160deg, #FDEDE7 0%, #EEF1F6 55%, #FFF7E6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  shell: {
    maxWidth: 400,
    width: '100%',
    textAlign: 'center',
  },
  globeWrap: {
    position: 'relative',
    width: 80,
    height: 80,
    margin: '0 auto 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  globeRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    border: '2px solid #E8491D',
    borderTopColor: 'transparent',
    animation: 'spin 1.4s linear infinite',
  },
  globe: { fontSize: 40 },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 36,
    lineHeight: 1.5,
  },
  stepList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    marginBottom: 28,
    textAlign: 'left',
  },
  stepRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    flexShrink: 0,
    fontWeight: 700,
    transition: 'background 0.3s ease',
  },
  stepLabel: {
    fontSize: 14,
    lineHeight: 1.4,
    transition: 'color 0.3s ease',
  },
  ellipsis: {
    display: 'inline-block',
    animation: 'pulse 1.2s ease infinite',
    marginLeft: 2,
    color: '#E8491D',
  },
  cachedBadge: {
    marginLeft: 6,
    fontSize: 11,
    background: '#dcfce7',
    color: '#166534',
    padding: '1px 6px',
    borderRadius: 99,
    fontWeight: 600,
  },
  progressTrack: {
    height: 6,
    background: '#e5e7eb',
    borderRadius: 99,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #E8491D, #E6A817)',
    borderRadius: 99,
    transition: 'width 0.5s ease',
  },
  progressLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  errorBox: {
    marginTop: 24,
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 12,
    padding: '14px 16px',
    textAlign: 'left',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#991b1b',
    marginBottom: 6,
  },
  errorMsg: {
    fontSize: 13,
    color: '#7f1d1d',
    marginBottom: 8,
    wordBreak: 'break-word',
  },
  errorHint: {
    fontSize: 12,
    color: '#92400e',
    background: '#fffbeb',
    padding: '6px 8px',
    borderRadius: 6,
    marginBottom: 12,
  },
  backBtn: {
    background: '#111827',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '9px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
};
