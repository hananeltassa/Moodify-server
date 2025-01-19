export const isDataStale = (updatedAt, maxAgeInHours = 24) => {
    const now = new Date();
    const lastUpdated = new Date(updatedAt);
    const hoursDiff = (now - lastUpdated) / (1000 * 60 * 60); 
    return hoursDiff > maxAgeInHours;
};
  