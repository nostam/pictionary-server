export class APIError extends Error {
  public status: number | undefined;
  public message: string;
  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    this.message = message;
  }
}
