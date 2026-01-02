import { Box } from '@chakra-ui/react';
import type { RefObject } from 'react';
import { useRef, useLayoutEffect, useEffect } from 'react';

const DEFAULT_CHAR_WIDTH_PX = 12;
const DEFAULT_CARET_START_OFFSET_PX = -3;

function measureMonospaceCharWidthPx(container: HTMLElement) {
  const probe = document.createElement('span');
  probe.textContent = 'MMMMMMMMMM';
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  probe.style.whiteSpace = 'pre';
  probe.style.left = '0';
  probe.style.top = '0';
  container.appendChild(probe);
  const width = probe.getBoundingClientRect().width / 10;
  probe.remove();
  return Number.isFinite(width) && width > 0 ? width : DEFAULT_CHAR_WIDTH_PX;
}

// WARNING: Vibe coded component
export default function TypingCaret({
  containerRef,
  activeWordIndex,
  activeTypedWord,
  isVisible,
}: {
  containerRef: RefObject<HTMLElement>;
  activeWordIndex: number;
  activeTypedWord: string | undefined;
  isVisible: boolean;
}) {
  const caretRef = useRef<HTMLDivElement>(null);
  const charWidthRef = useRef<number>(DEFAULT_CHAR_WIDTH_PX);

  const updateCaret = () => {
    const container = containerRef.current;
    const caretEl = caretRef.current;
    if (!container || !caretEl) return;

    if (!isVisible) {
      caretEl.style.opacity = '0';
      return;
    }

    const target = container.querySelector(
      `[data-word-index="${activeWordIndex}"]`,
    ) as HTMLElement | null;

    if (!target) {
      caretEl.style.opacity = '0';
      return;
    }

    const typedLen = activeTypedWord?.length ?? 0;
    const caretHeight = caretEl.getBoundingClientRect().height || 0;
    const charWidth = charWidthRef.current || DEFAULT_CHAR_WIDTH_PX;

    const x =
      target.offsetLeft +
      (typedLen > 0 ? charWidth * typedLen : DEFAULT_CARET_START_OFFSET_PX);
    const y = target.offsetTop + (target.offsetHeight - caretHeight) / 2;

    caretEl.style.opacity = '1';
    caretEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  useLayoutEffect(() => {
    updateCaret();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWordIndex, activeTypedWord?.length, isVisible]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    charWidthRef.current = measureMonospaceCharWidthPx(container);
    updateCaret();

    const onResize = () => {
      requestAnimationFrame(() => {
        const c = containerRef.current;
        if (c) charWidthRef.current = measureMonospaceCharWidthPx(c);
        updateCaret();
      });
    };

    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(onResize)
        : null;
    ro?.observe(container);
    window.addEventListener('resize', onResize);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef]);

  return (
    <Box
      ref={caretRef}
      bg='accent.200'
      className='caret'
      style={{
        left: 0,
        top: 0,
        transform: 'translate3d(0, 0, 0)',
        willChange: 'transform',
        pointerEvents: 'none',
      }}
    />
  );
}
