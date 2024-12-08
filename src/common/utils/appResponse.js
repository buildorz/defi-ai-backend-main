const AppResponse = ({ res, statusCode = 200, data, message }) => {
  res.status(statusCode).json({
    status: 'success',
    data: data ?? null,
    message: message ?? 'Success'
  });
};

module.exports = { AppResponse };
