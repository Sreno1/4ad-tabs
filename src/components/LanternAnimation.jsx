import React from 'react';

export default function LanternAnimation({ size = 24, className = '' }) {
  const [frame, setFrame] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % 38);
    }, 60);
    return () => clearInterval(interval);
  }, []);
  const pad = n => n.toString().padStart(3, '0');
  const src = `/assets/lantern/Lantern 6 - Bronze and Orange_${pad(frame)}.png`;
  return (
    <img
      src={src}
      alt="Lantern"
      width={size}
      height={size}
      className={className + ' inline-block align-middle'}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
