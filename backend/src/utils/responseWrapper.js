const successResponse = (data = null) => {
  return {
    success: true,
    data,
    error: null
  };
};

const errorResponse = (message, code = 'ERROR') => {
  return {
    success: false,
    data: null,
    error: {
      code,
      message
    }
  };
};

module.exports = {
  successResponse,
  errorResponse
};
