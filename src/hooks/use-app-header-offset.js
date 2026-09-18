'use client';

import * as React from 'react';
import { clearAppHeaderOffset, setAppHeaderOffsetPx } from '@/lib/app-header-offset';

/**
 * Publishes the measured app header height to --App-header-offset for fixed UI
 * (e.g. edit-form sticky name bar) when the non-production banner is shown.
 */
export function useAppHeaderOffset(headerRef, enabled) {
  React.useEffect(() => {
    if (!enabled) {
      clearAppHeaderOffset();
      return undefined;
    }

    const element = headerRef.current;
    if (!element) {
      return undefined;
    }

    const updateOffset = () => {
      setAppHeaderOffsetPx(element.getBoundingClientRect().height);
    };

    updateOffset();

    if (typeof ResizeObserver === 'undefined') {
      return () => {
        clearAppHeaderOffset();
      };
    }

    const resizeObserver = new ResizeObserver(updateOffset);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
      clearAppHeaderOffset();
    };
  }, [enabled, headerRef]);
}
