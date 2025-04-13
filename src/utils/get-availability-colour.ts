/**
 * Get Tailwind CSS class for availability text that works with dark/light mode
 * @param availableLots - Number of available parking lots
 * @returns Tailwind CSS class for text color
 */
const getAvailabilityColour = (availableLots: number): string => {
    if (availableLots <= 2) return "text-red-600 dark:text-red-400";
    if (availableLots <= 5) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
}

export default getAvailabilityColour;