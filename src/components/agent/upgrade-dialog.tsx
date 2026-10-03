import { m } from '@/paraglide/messages.js';
import { Pricing } from '@/blocks/pricing';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * The plan catalog in a modal, so upgrading never navigates away from a
 * running chat. Checkout lands back on /chat instead of the billing page.
 */
export function UpgradeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Grows with the viewport — three plan cards need the room — and stays
          scrollable on short screens. */}
      <DialogContent className="max-h-[90dvh] overflow-x-hidden overflow-y-auto rounded-3xl sm:max-w-3xl sm:p-6 lg:max-w-5xl xl:max-w-6xl [&_button]:min-h-11 [&_button]:min-w-11">
        <DialogHeader>
          <DialogTitle>{m['agent.plan.upgrade_title']()}</DialogTitle>
          <DialogDescription>
            {m['agent.plan.upgrade_description']()}
          </DialogDescription>
        </DialogHeader>
        <Pricing compact redirect="/chat" />
      </DialogContent>
    </Dialog>
  );
}
