import {
  getAvailableSlots,
  blockSlotTemporarily,
  releaseSlotIfExpired,
} from "./availability";

describe("US_026 - View available time slots for a date", () => {
  test("returns only available slots when the date has available time slots", () => {
    const slots = [
      { id: 1, time: "09:00", status: "available" },
      { id: 2, time: "10:00", status: "reserved" },
      { id: 3, time: "11:00", status: "available" },
      { id: 4, time: "12:00", status: "temporarily_blocked" },
    ];

    const result = getAvailableSlots(slots);

    expect(result).toHaveLength(2);
    expect(result[0].time).toBe("09:00");
    expect(result[1].time).toBe("11:00");
  });

  test("returns an empty array when the date has no available slots", () => {
    const slots = [
      { id: 1, time: "09:00", status: "reserved" },
      { id: 2, time: "10:00", status: "temporarily_blocked" },
    ];

    const result = getAvailableSlots(slots);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});

describe("US_028 - Select a time slot and block it temporarily", () => {
  test("blocks an available slot temporarily for 10 minutes", () => {
    const slot = { id: 1, time: "14:00", status: "available" };

    const blocked = blockSlotTemporarily(slot);

    expect(blocked.status).toBe("temporarily_blocked");
    expect(blocked.blockedUntil).toBeDefined();

    const diffMs = new Date(blocked.blockedUntil) - Date.now();
    const diffMinutes = diffMs / 1000 / 60;
    expect(diffMinutes).toBeGreaterThan(9);
    expect(diffMinutes).toBeLessThanOrEqual(10);
  });

  test("throws an error when trying to block an already unavailable slot", () => {
    const slot = { id: 2, time: "14:00", status: "reserved" };

    expect(() => blockSlotTemporarily(slot)).toThrow(
      "Time slot is no longer available"
    );
  });
});

describe("US_030 - Release time slot when booking timer expires", () => {
  test("releases a slot back to available when the 10-minute block has expired", () => {
    const expiredDate = new Date(Date.now() - 1000);

    const slot = {
      id: 3,
      time: "15:00",
      status: "temporarily_blocked",
      blockedUntil: expiredDate,
    };

    const result = releaseSlotIfExpired(slot);

    expect(result.status).toBe("available");
    expect(result.blockedUntil).toBeNull();
  });

  test("keeps the slot blocked when the 10-minute period has not expired yet", () => {
    const futureDate = new Date(Date.now() + 5 * 60 * 1000);

    const slot = {
      id: 4,
      time: "15:00",
      status: "temporarily_blocked",
      blockedUntil: futureDate,
    };

    const result = releaseSlotIfExpired(slot);

    expect(result.status).toBe("temporarily_blocked");
    expect(result.blockedUntil).toEqual(futureDate);
  });
});