class BadRequestError extends Error {
  statusCode: number;
  isCustomError = true;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: any) {
    super(message);
    this.name = "BAD_REQUEST_ERROR";
    this.statusCode = 400;
  }
}

export { BadRequestError  }