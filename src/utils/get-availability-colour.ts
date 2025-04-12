const getAvailabilityColour = (availableLots: number): string => {
    if (availableLots <= 5) return "text-yellow-600";
    if (availableLots <= 2) return "text-red-600";
    return "text-green-600"
}

export default getAvailabilityColour;