/**
 * generateSlots
 *
 * Supports two calling modes:
 *
 * NEW (slots array — used by ClinicalAvailability):
 *   generateSlots(slots, duration, breakTime)
 *   slots = [{ start: "09:00", end: "13:00" }, { start: "14:00", end: "17:00" }]
 *
 * OLD (single start/end string — backward-compat fallback):
 *   generateSlots(start, end, duration, breakTime)
 *   start = "09:00", end = "17:00"
 */
export function generateSlots(slotsOrStart, durationOrEnd, breakTimeOrDuration, maybeBreakTime) {
  let slots;
  let duration;
  let breakTime;

  // Detect which calling mode is being used
  if (Array.isArray(slotsOrStart)) {
    // NEW mode: (slots[], duration, breakTime)
    slots     = slotsOrStart;
    duration  = durationOrEnd;
    breakTime = breakTimeOrDuration;
  } else {
    // OLD mode: (start, end, duration, breakTime)  ← backward compat
    slots     = [{ start: slotsOrStart, end: durationOrEnd }];
    duration  = breakTimeOrDuration;
    breakTime = maybeBreakTime;
  }

  const result = [];

  for (const { start, end } of slots) {
    if (!start || !end) continue;

    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    let current = sh * 60 + sm;
    const endMin = eh * 60 + em;

    while (current + duration <= endMin) {
      const h = String(Math.floor(current / 60)).padStart(2, "0");
      const m = String(current % 60).padStart(2, "0");
      const timeStr = `${h}:${m}`;

      // Skip if this slot falls inside break time
      if (breakTime?.start && breakTime?.end) {
        const [bsh, bsm] = breakTime.start.split(":").map(Number);
        const [beh, bem] = breakTime.end.split(":").map(Number);
        const breakStart = bsh * 60 + bsm;
        const breakEnd   = beh * 60 + bem;

        if (current >= breakStart && current < breakEnd) {
          current += duration;
          continue;
        }
      }

      result.push(timeStr);
      current += duration;
    }
  }

  return result;
}