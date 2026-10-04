'use client';

import { Toaster as SonnerToaster, toast } from 'sonner';

// Veteran and guardian edit forms pin Cancel and Save to a fixed bottom bar
// (~73px, with 80px of form padding). Sonner's default 24px offset paints the
// success toast on top of those buttons. Keep the bottom-right stack, lifted
// above the bar. Unspecified edges stay at Sonner's own defaults.
const TOAST_BOTTOM_OFFSET = '96px';

export function Toaster(props) {
  return (
    <SonnerToaster offset={{ bottom: TOAST_BOTTOM_OFFSET }} mobileOffset={{ bottom: TOAST_BOTTOM_OFFSET }} {...props} />
  );
}

export { toast };
