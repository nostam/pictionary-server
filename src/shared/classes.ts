export class APIError extends Error {
  public status: number | undefined;
  public message: string;
  constructor(message: string, status?: number) {
    super(message);
    this.status ?? status;
    this.message = message;
  }
}
