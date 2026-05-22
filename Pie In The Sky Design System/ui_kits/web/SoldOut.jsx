// SoldOut.jsx — Pie In The Sky
// Sold out / unavailable state

const SoldOut = ({ onBack }) => {
  return (
    <div style={{ textAlign: 'center', padding: '0 8px' }}>
      <div style={{ marginBottom: 20 }}>
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          {/* Empty pie dish */}
          <ellipse cx="32" cy="36" rx="22" ry="8" fill="#EDE4D5"/>
          <path d="M10 36 Q10 54 32 54 Q54 54 54 36 Z" fill="#D9CDBC"/>
          <ellipse cx="32" cy="36" rx="22" ry="8" fill="none" stroke="#BFB09C" strokeWidth="2"/>
          {/* Sad cloud above */}
          <path d="M22 20 Q22 13 28 13 Q29 9 35 10 Q41 10 41 16 Q45 16 45 21 Q45 25 41 25 L22 25 Q18 25 18 21 Q18 17 22 20Z" fill="#E0F0FC" opacity="0.7"/>
        </svg>
      </div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: '#5C3A1E', marginBottom: 10 }}>
        Sold out for today.
      </div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#7A6C5A', lineHeight: 1.7, marginBottom: 32 }}>
        Every pie we bake flies out the door.<br/>
        Back tomorrow at <strong style={{ color: '#5C3A1E' }}>9am</strong>.
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: '#F7F1E8', borderRadius: 12, padding: '12px 20px',
        fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#7A6C5A',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9E8E79" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6 L12 12 L16 14"/>
        </svg>
        Opens again in ~18 hours
      </div>
    </div>
  );
};

Object.assign(window, { SoldOut });
