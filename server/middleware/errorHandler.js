export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";

  if (!err.isOperational) {
    console.error("[unhandled error]", err);
  }

  res.status(statusCode).json({
    error: {
      code,
      message: err.isOperational ? err.message : "Something went wrong",
    },
  });
}
