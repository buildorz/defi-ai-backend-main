const { ENVIRONMENT } = require('../environment');

const transcribeAudioToText = async (audioBuffer) => {
  const formData = new FormData();
  formData.append('model', 'whisper-1');

  const file = new File([audioBuffer], 'audio.wav', { type: 'audio/wav' });
  formData.append('file', file);

  try {
    const response = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ENVIRONMENT.OPEN_AI.API_KEY}`
        },
        body: formData
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: 'Error transcribing audio'
      };
    }

    const data = await response.json();
    return {
      success: true,
      text: data.text
    };
  } catch (error) {
    console.error('Error transcribing audio:', error);
  }
};

module.exports = { transcribeAudioToText };
