import axios from "axios";

export const textDetectedMood = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text input is required' });
  }

  try {
    const response = await axios.post(`${process.env.DJANGO_API_BASE_URL}detect-text-mood/`, {
      input_data: text,
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error calling Django API:', error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data || 'Error from Django API',
      });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};

