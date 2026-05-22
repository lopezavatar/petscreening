// StatusPanel.jsx — Pie In The Sky
// Frosted-glass delivery tracking panel with animated drone

const StatusPanel = ({ onDelivered }) => {
  const [eta, setEta] = React.useState(12);
  const [phase, setPhase] = React.useState('airborne'); // airborne | delivered

  React.useEffect(() => {
    if (phase !== 'airborne') return;
    const interval = setInterval(() => {
      setEta(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => {
            setPhase('delivered');
            if (onDelivered) onDelivered();
          }, 800);
          return 0;
        }
        return prev - 1;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [phase]);

  const panelStyle = {
    background: 'rgba(253,250,245,0.92)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(237,228,213,0.7)',
    borderRadius: 24,
    boxShadow: '0 8px 40px rgba(92,58,30,0.14)',
    padding: '32px 28px',
    width: '100%',
    maxWidth: 340,
    textAlign: 'center',
  };

  if (phase === 'delivered') {
    return (
      <div style={panelStyle}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="26" fill="#D1F0E2"/>
            <path d="M17 28 L24 35 L39 20" stroke="#2D9E5F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: '#5C3A1E', marginBottom: 8 }}>Delivered.</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#7A6C5A', lineHeight: 1.6 }}>
          Enjoy your pie. We'll be here tomorrow.
        </div>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <DroneAnimation />
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: '#5C3A1E', marginBottom: 6 }}>
        Your pie is airborne.
      </div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#7A6C5A', marginBottom: 24, lineHeight: 1.6 }}>
        Flying to you now via Drone 7.
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 4, marginBottom: 28 }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 52, fontWeight: 300, color: '#D97D18', letterSpacing: '-0.02em', lineHeight: 1, transition: 'all 0.4s ease' }}>{eta}</span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#9E8E79' }}>min away</span>
      </div>

      <TrackingSteps eta={eta} />
    </div>
  );
};

const DroneAnimation = () => {
  const style = {
    marginBottom: 20,
    animation: 'droneBob 4s ease-in-out infinite',
    display: 'inline-block',
  };
  return (
    <div style={{ marginBottom: 20 }}>
      <style>{`@keyframes droneBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
      <span style={style}>
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <ellipse cx="28" cy="10" rx="12" ry="5" fill="#D97D18" opacity="0.85" transform="rotate(-20 28 10)"/>
          <ellipse cx="28" cy="10" rx="12" ry="5" fill="#D97D18" opacity="0.45" transform="rotate(70 28 10)"/>
          <circle cx="28" cy="10" r="4" fill="#8F4A0D"/>
          <line x1="28" y1="14" x2="28" y2="26" stroke="#5C3A1E" strokeWidth="2.5" strokeLinecap="round"/>
          <ellipse cx="28" cy="32" rx="16" ry="6" fill="#F5BC6E"/>
          <path d="M12 32 Q12 48 28 48 Q44 48 44 32 Z" fill="#EF9C38"/>
          <ellipse cx="28" cy="32" rx="16" ry="6" fill="none" stroke="#D97D18" strokeWidth="2"/>
          <path d="M20 26 Q18 21 20 17" stroke="#BAE0F9" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          <path d="M28 24 Q26 19 28 16" stroke="#BAE0F9" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
          <path d="M36 26 Q34 21 36 17" stroke="#BAE0F9" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        </svg>
      </span>
    </div>
  );
};

const TrackingSteps = ({ eta }) => {
  const steps = [
    { label: 'Order placed', time: '2:14 pm', done: true },
    { label: 'Airborne', time: '2:18 pm', done: true },
    { label: 'Delivered', time: `~ ${eta} min`, done: false },
  ];
  return (
    <div style={{ textAlign: 'left' }}>
      {steps.map((step, i) => (
        <div key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: step.done ? '#D97D18' : '#EDE4D5', flexShrink: 0 }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: step.done ? '#5C3A1E' : '#9E8E79', fontWeight: step.done ? 500 : 400 }}>{step.label}</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#9E8E79', marginLeft: 'auto' }}>{step.time}</span>
          </div>
          {i < steps.length - 1 && <div style={{ width: 2, height: 14, background: '#EDE4D5', marginLeft: 4, marginTop: 2, marginBottom: 2 }} />}
        </div>
      ))}
    </div>
  );
};

Object.assign(window, { StatusPanel });
