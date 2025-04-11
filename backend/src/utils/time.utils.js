/**
 * Convert HH:mm time format to minutes since midnight
 * @param {string} timeString Time in HH:mm format
 * @returns {number} Minutes since midnight (0-1439)
 */
exports.timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes since midnight to HH:mm time format
 * @param {number} minutes Minutes since midnight (0-1439)
 * @returns {string} Time in HH:mm format
 */
exports.minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

/**
 * Format duration in minutes to human readable format
 * @param {number} minutes Duration in minutes
 * @returns {string} Formatted duration (e.g., "2h 30m")
 */
exports.formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Format a date to YYYY-MM-DD string
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
exports.formatDate = (date) => {
  if (!date) return null;
  return date.toISOString().split("T")[0];
};
