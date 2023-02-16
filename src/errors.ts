class BadRequestError extends Error {
  statusCode: number;
  isCustomError = true;

  constructor(message: string) {
    super(message);
    this.name = "BAD_REQUEST_ERROR";
    this.statusCode = 400;
  }
}

export { BadRequestError  }