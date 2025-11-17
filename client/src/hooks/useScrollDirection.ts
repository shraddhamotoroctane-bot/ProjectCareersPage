import { useEffect, useState, useRef } from 'react';

type ScrollDirection = 'away' | 'toward';

interface ScrollState {
  direction: ScrollDirection;
  atTop: boolean;
  y: number;
}

export function useScrollDirection(hideThreshold = 64, delta = 8): ScrollState {
  const [scrollState, setScrollState] = useState<ScrollState>({
    direction: 'toward',
    atTop: true,
    y: 0
  });
  
  const lastYRef = useRef(0);
  const rafIdRef = useRef<number>();

  useEffect(() => {
    const handleScroll = () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const diff = currentY - lastYRef.current;
        
        // Only update if the scroll difference is significant enough
        if (Math.abs(diff) > delta) {
          const newDirection: ScrollDirection = diff > 0 ? 'away' : 'toward';
          const newAtTop = currentY <= 8;
          
          setScrollState(prev => {
            // Only update state if something actually changed
            if (prev.direction !== newDirection || prev.atTop !== newAtTop || prev.y !== currentY) {
              return {
                direction: newDirection,
                atTop: newAtTop,
                y: currentY
              };
            }
            return prev;
          });
          
          lastYRef.current = currentY;
        }
      });
    };

    // Set initial values
    lastYRef.current = window.scrollY;
    setScrollState({
      direction: 'toward',
      atTop: window.scrollY <= 8,
      y: window.scrollY
    });

    // Add passive scroll listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [delta, hideThreshold]);

  return scrollState;
}