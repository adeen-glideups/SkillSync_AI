const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendCreated = (res, data, message = 'Created successfully') => {
  sendSuccess(res, data, message, 201);
};

const sendNoContent = (res) => {
  res.status(204).send();
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendNoContent,
};
