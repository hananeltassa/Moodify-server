export const handleApiError = (error, res, defaultMessage) => {
  const apiError = error.response?.data || error.message;

  // Log the error for debugging
  console.error("API Error:", apiError);

  // Handle specific HTTP errors
  const statusCode = error.response?.status || 500;

  // Specific message handling for APIs
  let message = defaultMessage;

  if (statusCode === 401) {
    message = "API access token expired or unauthorized. Please reauthenticate.";
  } else if (statusCode === 403) {
    message = "Access forbidden. Ensure you have the correct API permissions.";
  } else if (statusCode === 404) {
    message = "Requested resource not found.";
  } else if (statusCode >= 500) {
    message = "API service is currently unavailable. Please try again later.";
  }

  return res.status(statusCode).json({ message });
};
