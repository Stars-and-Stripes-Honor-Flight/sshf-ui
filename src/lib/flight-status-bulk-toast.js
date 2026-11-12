import { toast } from '@/components/core/toaster';

export function toastCompleteFlightResult(status, body) {
  const changed = body?.counts?.changed ?? 0;
  const failed = body?.counts?.failed ?? 0;

  if (status === 200) {
    toast.success(
      `${changed} Active ${changed === 1 ? 'person was' : 'people were'} marked Flown. The flight is marked completed.`
    );
    return;
  }

  if (status === 207) {
    const message = `${failed} ${failed === 1 ? 'person' : 'people'} could not be updated. Retry to finish the remaining records.`;
    toast.warning(message);
  }
}

export function toastActivateFutureStatusResult(status, body) {
  const changed = body?.counts?.changed ?? 0;
  const failed = body?.counts?.failed ?? 0;
  const assigned = body?.assignedToFlight;

  if (status === 200) {
    let message = `Activated ${changed} ${changed === 1 ? 'person' : 'people'} to Active.`;
    if (assigned?.length) {
      message += ` ${assigned.length} ${assigned.length === 1 ? 'was' : 'were'} already assigned to a flight: ${assigned.join(', ')}.`;
    }
    toast.success(message);
    return;
  }

  if (status === 207) {
    const message = `${failed} ${failed === 1 ? 'person' : 'people'} could not be activated. Retry to finish the remaining records.`;
    toast.warning(message);
  }
}
