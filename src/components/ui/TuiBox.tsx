import React, { forwardRef, useRef, useEffect, useState, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';

const GLITCH_CHARS = '!@#$%^&*_+-=[]{}|;:<>?/~';

interface TuiBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  className?: string;
  children: React.ReactNode;
  showTitle?: boolean;
  onClose?: () => void;
}

// Forward ref is required for react-grid-layout to work correctly with custom components
export const TuiBox = forwardRef<HTMLDivElement, TuiBoxProps>(({ title, className = '', children, showTitle = true, onClose, ...props }, ref) => {
  const { borderGlow, widgetRadius, visualStyle } = useAppContext();
  const effectiveBorderGlow = visualStyle === 'holographic' ? false : borderGlow;
  const innerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [titleEnd, setTitleEnd] = useState(0);

  // Title glitch state
  const [titleDisplay, setTitleDisplay] = useState(title);
  const isHovering = useRef(false);
  const glitchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setTitleDisplay(title); }, [title]);

  const scramble = useCallback(() => {
    let tick = 0;
    const maxTicks = title.length;
    const run = () => {
      if (!isHovering.current || tick >= maxTicks) {
        setTitleDisplay(title);
        return;
      }
      tick++;
      setTitleDisplay(
        title.split('').map((ch, i) =>
          i < tick ? ch : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        ).join('')
      );
      glitchTimer.current = setTimeout(run, 40);
    };
    run();
  }, [title]);

  const handleTitleEnter = () => {
    isHovering.current = true;
    scramble();
  };

  const handleTitleLeave = () => {
    isHovering.current = false;
    if (glitchTimer.current) clearTimeout(glitchTimer.current);
    setTitleDisplay(title);
  };

  const setRefs = useCallback((node: HTMLDivElement | null) => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  }, [ref]);

  useEffect(() => {
    if (!effectiveBorderGlow || !innerRef.current) return;
    const el = innerRef.current;
    const observer = new ResizeObserver(() => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (w > 0 && h > 0) setDims({ w, h });
      if (titleRef.current && showTitle) {
        setTitleEnd(1 + titleRef.current.offsetLeft + titleRef.current.offsetWidth);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [effectiveBorderGlow, showTitle]);

  // Build SVG path that starts right after the title and traces clockwise
  const w = dims.w, h = dims.h;
  const r = Math.max(0, Math.min(widgetRadius, (w - 1) / 2, (h - 1) / 2));
  const sx = showTitle && titleEnd > 0 ? Math.max(titleEnd, 0.5 + r) : 0.5 + r;

  let d = '';
  if (w > 0 && h > 0) {
    if (r <= 0) {
      d = `M${sx},0.5 L${w - 0.5},0.5 L${w - 0.5},${h - 0.5} L0.5,${h - 0.5} L0.5,0.5 L${sx},0.5`;
    } else {
      d = [
        `M${sx},0.5`,
        `L${w - 0.5 - r},0.5`,
        `A${r},${r} 0 0 1 ${w - 0.5},${0.5 + r}`,
        `L${w - 0.5},${h - 0.5 - r}`,
        `A${r},${r} 0 0 1 ${w - 0.5 - r},${h - 0.5}`,
        `L${0.5 + r},${h - 0.5}`,
        `A${r},${r} 0 0 1 0.5,${h - 0.5 - r}`,
        `L0.5,${0.5 + r}`,
        `A${r},${r} 0 0 1 ${0.5 + r},0.5`,
        `L${sx},0.5`,
      ].join(' ');
    }
  }

  // Perimeter calculation
  const perimeter = r <= 0
    ? 2 * (w - 1) + 2 * (h - 1)
    : 2 * ((w - 1) - 2 * r) + 2 * ((h - 1) - 2 * r) + 2 * Math.PI * r;

  return (
    <div
      ref={setRefs}
      className={`border border-[var(--color-border)] border-opacity-60 bg-[var(--color-bg)] relative flex flex-col widget-rounded hover:bg-[var(--color-hover)] transition-colors duration-75 ${effectiveBorderGlow ? 'widget-glow' : ''} ${className}`}
      style={props.style}
      onMouseEnter={handleTitleEnter}
      onMouseLeave={handleTitleLeave}
      {...props}
    >
      {/* SVG border glow overlay — path starts after title, traces clockwise */}
      {effectiveBorderGlow && w > 0 && d && (
        <svg
          style={{ position: 'absolute', top: -1, left: -1, width: w, height: h, pointerEvents: 'none', zIndex: 10, overflow: 'visible' }}
          viewBox={`0 0 ${w} ${h}`}
        >
          <path
            className="widget-glow-border"
            d={d}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1"
            strokeDasharray={perimeter}
            style={{ '--perimeter': perimeter } as React.CSSProperties}
          />
        </svg>
      )}

      {/* Simulated Legend/Title or Invisible Handle */}
      {showTitle ? (
        <div className="flex items-center justify-between pointer-events-none z-20" style={{ lineHeight: '1.2rem', marginTop: '-0.6rem' }}>
          <div
            ref={titleRef}
            className="ml-3 bg-[var(--color-bg)] px-2 text-[var(--color-muted)] text-sm lowercase font-bold select-none cursor-move drag-handle pointer-events-auto widget-title transition-all duration-300"
          >
            {titleDisplay}
          </div>
          {onClose && (
            <div
              className="mr-3 bg-[var(--color-bg)] px-2 text-[var(--color-muted)] hover:text-red-500 text-sm font-bold cursor-pointer pointer-events-auto"
              onClick={onClose}
            >
              [x]
            </div>
          )}
        </div>
      ) : (
        <>
            <div
            className="absolute top-0 left-0 w-full h-4 z-20 cursor-move drag-handle"
            title={title}
            />
            {onClose && (
            <div
              className="absolute top-0 right-0 z-30 px-2 text-[var(--color-muted)] hover:text-red-500 text-sm font-bold cursor-pointer"
              onClick={onClose}
            >
              [x]
            </div>
            )}
        </>
      )}

      {/* Content Area - Inner overflow handling (resize handles excluded) */}
      <div className="flex-1 min-h-0 min-w-0 w-full relative p-3 overflow-hidden">
        {(() => {
          const childArray = React.Children.toArray(children);
          const widgetContent: React.ReactNode[] = [];
          childArray.forEach(child => {
            if (
              React.isValidElement(child) &&
              typeof child.key === 'string' &&
              child.key.includes('resizableHandle')
            ) {
              // skip — rendered below
            } else {
              widgetContent.push(child);
            }
          });
          return widgetContent;
        })()}
      </div>

      {/* Resize handles — direct children of outer div for correct absolute positioning */}
      {React.Children.toArray(children).filter(
        child =>
          React.isValidElement(child) &&
          typeof child.key === 'string' &&
          child.key.includes('resizableHandle')
      )}
    </div>
  );
});

TuiBox.displayName = 'TuiBox';
