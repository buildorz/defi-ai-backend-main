const constructConversation = (
  message,
  data,
  confirmation,
  stringify = true,
  confirmationTime = 0,
  imageData = false
) => {
  return {
    message: stringify ? JSON.stringify(message) : message,
    confirmation: confirmation,
    data: data,
    confirmationTime: confirmationTime,
    imageData: imageData
  };
};

module.exports = constructConversation;
