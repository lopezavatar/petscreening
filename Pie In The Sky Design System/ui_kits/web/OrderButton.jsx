// OrderButton.jsx — Pie In The Sky
// The primary CTA button with spring animation and loading state

const OrderButton = ({ onClick, loading, disabled }) => {
  const [pressed, setPressed] = React.useState(false);

  const handleClick = () => {
    if (disabled || loading) return;
    setPressed(true);
    setTimeout(() => setPressed(false), 150);
    if (onClick) onClick();
  };

  const style = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    background: disabled ? '#BFB09C' : '#D97D18',
    color: '#fff',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '22px 64px',
    borderRadius: 9999,
    boxShadow: disabled ? 'none' : '0 2px 16px rgba(217,125,24,0.35)',
    transform: pressed ? 'scale(0.96)' : 'scale(1)',
    transition: 'transform 150ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 300ms ease, background 200ms ease',
    minWidth: 200,
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
  };

  const hoverStyle = {
    background: '#B86210',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 24px rgba(217,125,24,0.45)',
  };

  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      style={{ ...style, ...(hovered && !disabled ? hoverStyle : {}), ...(pressed ? { transform: 'scale(0.96)', boxShadow: 'none' } : {}) }}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={disabled}
    >
      {loading ? (
        <>
          <SpinnerIcon />
          <span>Placing order…</span>
        </>
      ) : (
        <span>ORDER</span>
      )}
    </button>
  );
};

const SpinnerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <g style={{ animation: 'spin 0.8s linear infinite', transformOrigin: '12px 12px' }}>
      <path d="M12 2 A10 10 0 0 1 22 12" />
    </g>
  </svg>
);

Object.assign(window, { OrderButton });
