export const handleApiError = (error, res, defaultMessage) => {
    console.error("Spotify API Error:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      return res.status(401).json({ message: "Spotify access token expired. Please log in again." });
    }
    return res.status(500).json({ message: defaultMessage });
};
  