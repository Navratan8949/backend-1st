class ApiError extends Error {
  constructor(
    statusCode,
    message = "something went wrong",
    error = [],
    stack = ""
  ) {
    super(message); // Call the parent Error constructor with the message
    this.statusCode = statusCode; // HTTP status code for the error
    this.message = message; // Error message
    this.data = null; // Default data is null in case of an error
    this.error = error; // Additional error details or array of errors
    this.success = false; // Success is false for errors

    // Set the stack trace
    if (stack) {
      this.stack = stack; // Use the provided stack trace if available
    } else {
      Error.captureStackTrace(this, this.constructor); // Otherwise, capture the stack trace
    }
  }
}
export { ApiError };
