/**
 * Utility function to get theme-aware colors
 * @param lightModeColor - Color to use in light mode (hex, rgb, etc)
 * @param darkModeColor - CSS variable for dark mode (from theme)
 * @param fallback - Fallback color for SSR
 * @returns The appropriate color based on current theme
 */
export const getThemeColor = (
  lightModeColor: string,
  darkModeColor: string,
  fallback?: string
): string => {
  if (typeof window !== 'undefined') {
    const isDarkMode = document.documentElement.classList.contains('dark');
    return isDarkMode ? darkModeColor : lightModeColor;
  }
  
  // Fallback for SSR
  return fallback ?? lightModeColor;
};

/**
 * Get availability-based color that respects theme
 * @param availableLots - Number of available parking lots
 * @returns Theme-aware color for availability indicator
 */
export const getAvailabilityThemeColor = (availableLots: number): string => {
  if (availableLots === 0) {
    return getThemeColor(
      "#DC2626", // light mode
      "#DC2626", // dark mode
      "#DC2626" // fallback
    );
  } else if (availableLots < 20) {
    return getThemeColor(
      "#F59E0B", // light mode
      "#F59E0B", // dark mode
      "#F59E0B" // fallback
    );
  } else {
    return getThemeColor(
      "#10B981", // light mode
      "#10B981", // dark mode
      "#10B981" // fallback
    );
  }
};