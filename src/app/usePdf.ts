import { useToast } from './Toast';

/**
 * Runs the making of a PDF (drawn on the device, then handed to the share sheet) from a
 * tap; if it fails, a toast says so instead of nothing happening.
 */
export function usePdf() {
  const toast = useToast();
  return (make: () => Promise<void>) => {
    make().catch((e: unknown) => {
      console.error(e);
      toast('Das PDF ließ sich nicht erstellen');
    });
  };
}
