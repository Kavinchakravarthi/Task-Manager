export const sendSuccess = <T>(res: any, statusCode = 200, data?: T, message?: string) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const sendError = (res: any, statusCode = 500, message = 'Server error', details?: unknown) => {
  return res.status(statusCode).json({
    success: false,
    message,
    details
  });
};
