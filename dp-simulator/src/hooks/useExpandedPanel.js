import { useEffect, useRef, useState } from 'react';

// Expand within the browser page. Never enter OS/browser fullscreen.
export function useExpandedPanel() {
  const [expanded, setExpanded] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!expanded) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const resetScroll = () => {
      if (!panelRef.current) return;
      panelRef.current.scrollTop = 0;
      panelRef.current.scrollLeft = 0;
    };
    panelRef.current?.querySelector('[data-close-expanded]')?.focus({ preventScroll: true });
    resetScroll();
    // Wait for the graph's resize before clearing the old inline scroll anchor.
    const frame = requestAnimationFrame(resetScroll);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
      else panelRef.current?.querySelector('[aria-label="Expand simulation"]')?.focus();
    };
  }, [expanded]);

  const onKeyDown = event => {
    if (!expanded) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setExpanded(false);
    }
    if (event.key !== 'Tab') return;
    const controls = [...panelRef.current.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')]
      .filter(element => element.getClientRects().length > 0);
    const first = controls[0], last = controls.at(-1);
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  };

  return {
    expanded,
    toggle: () => setExpanded(value => !value),
    close: () => setExpanded(false),
    panelProps: { ref: panelRef, onKeyDown, role: expanded ? 'dialog' : undefined, 'aria-modal': expanded ? true : undefined },
  };
}
