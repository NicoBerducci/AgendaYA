 /**
 * AgendaYA - Booking: availability
 * Asignee: Gracia Ignacio
 * US: US_026, US_028, US_030
 */

export function getAvailableSlots(slots) {
  if (!slots || slots.length === 0) return [];
  return slots.filter((slot) => slot.status === "available");
}

export function blockSlotTemporarily(slot) {
  if (!slot) throw new Error("Slot is required");
  if (slot.status !== "available") {
    throw new Error("Time slot is no longer available");
  }
  const blockedUntil = new Date(Date.now() + 10 * 60 * 1000);
  return {
    ...slot,
    status: "temporarily_blocked",
    blockedUntil,
  };
}

export function releaseSlotIfExpired(slot) {
  if (!slot) throw new Error("Slot is required");
  if (slot.status !== "temporarily_blocked") return slot;
  const now = new Date();
  const isExpired = now >= new Date(slot.blockedUntil);
  if (isExpired) {
    return {
      ...slot,
      status: "available",
      blockedUntil: null,
    };
  }
  return slot;
}
