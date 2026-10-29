import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function placeMenu(element) {
  const menu = element.querySelector('.simulator-tools-menu');
  if (!menu || !element.querySelector('details')?.open) return;
  const parent = element.parentElement;
  const bounds = parent.getBoundingClientRect();
  const icon = element.getBoundingClientRect();
  const x = icon.left - bounds.left - parent.clientLeft;
  const y = icon.top - bounds.top - parent.clientTop;
  menu.style.maxWidth = `${Math.max(0, parent.clientWidth - 16)}px`;
  menu.style.maxHeight = `${Math.max(0, Math.min(350, parent.clientHeight - 64))}px`;
  const left = Math.max(8, Math.min(x + element.offsetWidth - menu.offsetWidth, parent.clientWidth - menu.offsetWidth - 8));
  const below = y + element.offsetHeight + 8;
  const preferred = below + menu.offsetHeight <= parent.clientHeight - 8 ? below : y - menu.offsetHeight - 8;
  const top = Math.max(8, Math.min(preferred, parent.clientHeight - menu.offsetHeight - 8));
  menu.style.left = `${left - x}px`;
  menu.style.top = `${top - y}px`;
}

export default function MovableOverlay({ children, className, label }) {
  const overlayRef = useRef(null);
  const drag = useRef(null);
  const moved = useRef(false);
  const [position, setPosition] = useState(null);
  const constrain = (point, element) => ({
    x: Math.max(8, Math.min(point.x, element.parentElement.clientWidth - element.offsetWidth - 8)),
    y: Math.max(8, Math.min(point.y, element.parentElement.clientHeight - element.offsetHeight - 8)),
  });
  useBrowserLayoutEffect(() => { placeMenu(overlayRef.current); }, [children, position]);
  useEffect(() => {
    const element = overlayRef.current;
    const observer = new ResizeObserver(() => {
      placeMenu(element);
      setPosition(previous => {
        if (!previous) return previous;
        const next = constrain(previous, element);
        return next.x === previous.x && next.y === previous.y ? previous : next;
      });
    });
    observer.observe(element);
    observer.observe(element.parentElement);
    return () => observer.disconnect();
  }, []);
  return <div ref={overlayRef} className={`movable-overlay ${className}`} style={position ? { position: 'absolute', gridArea: 'auto', margin: 0, left: position.x, top: position.y, right: 'auto', bottom: 'auto' } : undefined}
      role="group" tabIndex={0} aria-label={`Movable ${label}`} title="Drag the background to move · Arrow keys also move"
      onPointerDown={event => {
        if (event.button !== 0 || event.target.closest('button, input, select, textarea, label, a, .simulator-tools-menu')) return;
        moved.current = false;
        const element = overlayRef.current;
        drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, left: element.offsetLeft, top: element.offsetTop };
        (event.target.closest('summary') || event.currentTarget).setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        const start = drag.current;
        if (!start || start.id !== event.pointerId) return;
        if (!moved.current && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 5) return;
        moved.current = true;
        event.preventDefault();
        setPosition(constrain({ x: start.left + event.clientX - start.x, y: start.top + event.clientY - start.y }, overlayRef.current));
      }}
      onPointerUp={event => {
        drag.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}
      onClickCapture={event => {
        if (!moved.current) return;
        moved.current = false;
        event.preventDefault();
        event.stopPropagation();
      }}
      onKeyDown={event => {
        if (event.target !== event.currentTarget) return;
        const offset = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[event.key];
        if (!offset) return;
        event.preventDefault();
        const element = overlayRef.current;
        setPosition(constrain({ x: element.offsetLeft + offset[0], y: element.offsetTop + offset[1] }, element));
      }}>
    {children}
  </div>;
}
