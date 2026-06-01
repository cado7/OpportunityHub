/**
 * Checks if a given closing date has passed today's date.
 * @param closingDateStr A date string, typically in YYYY-MM-DD format, or "Ongoing"/null
 * @returns boolean true if the closing date is in the past, false otherwise
 */
export function isOpportunityClosed(closingDateStr?: string): boolean {
  if (!closingDateStr) return false;
  
  const trimmed = closingDateStr.trim().toLowerCase();
  if (
    !trimmed || 
    trimmed === 'ongoing' || 
    trimmed === 'ongoing/bursary' || 
    trimmed === 'n/a' || 
    trimmed === 'none'
  ) {
    return false;
  }

  try {
    const closingDate = new Date(closingDateStr);
    
    // Check if valid date
    if (isNaN(closingDate.getTime())) {
      // Try parsing human format (e.g. "30 June 2025")
      const parsed = Date.parse(closingDateStr);
      if (isNaN(parsed)) {
        return false;
      }
      const pDate = new Date(parsed);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      pDate.setHours(0, 0, 0, 0);
      return today.getTime() > pDate.getTime();
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    closingDate.setHours(0, 0, 0, 0);
    
    return today.getTime() > closingDate.getTime();
  } catch (error) {
    return false;
  }
}

/**
 * Gets a numeric ranking value for any closing date/deadline string.
 * Higher values represent deadlines furthest in the future.
 * Expired deadlines are ranked lowest.
 */
export function getClosingDateTimestamp(closingDateStr?: string): number {
  if (!closingDateStr) return 1;
  const trimmed = closingDateStr.trim().toLowerCase();
  if (
    !trimmed || 
    trimmed === 'ongoing' || 
    trimmed === 'ongoing/bursary' || 
    trimmed === 'n/a' || 
    trimmed === 'none'
  ) {
    return 2; // ongoing has no end date, we place it below defined future deadlines but above expired
  }
  try {
    let d = new Date(closingDateStr);
    if (isNaN(d.getTime())) {
      const parsed = Date.parse(closingDateStr);
      if (isNaN(parsed)) return 2;
      d = new Date(parsed);
    }
    const ts = d.getTime();
    if (isNaN(ts)) return 2;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);

    if (today.getTime() > d.getTime()) {
      // Expired date. We want to sort it at the absolute bottom.
      return -ts;
    }
    return ts;
  } catch (e) {
    return 2;
  }
}

/**
 * Gets a human-readable remaining time, or "Closed" if it has passed.
 * @param closingDateStr A date string
 */
export function getRemainingDaysText(closingDateStr?: string): string {
  if (!closingDateStr) return 'Ongoing';
  
  const trimmed = closingDateStr.trim().toLowerCase();
  if (
    !trimmed || 
    trimmed === 'ongoing' || 
    trimmed === 'ongoing/bursary' || 
    trimmed === 'n/a' || 
    trimmed === 'none'
  ) {
    return 'Ongoing';
  }

  try {
    let closingDate = new Date(closingDateStr);
    if (isNaN(closingDate.getTime())) {
      const parsed = Date.parse(closingDateStr);
      if (isNaN(parsed)) {
        return closingDateStr; // Return raw value as fallback if it's custom text
      }
      closingDate = new Date(parsed);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    closingDate.setHours(0, 0, 0, 0);

    const diffTime = closingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Closed';
    } else if (diffDays === 0) {
      return 'Closes today';
    } else if (diffDays === 1) {
      return 'Closes tomorrow';
    } else {
      return `${diffDays} days left`;
    }
  } catch (error) {
    return closingDateStr;
  }
}
