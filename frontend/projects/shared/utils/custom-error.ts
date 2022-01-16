export class CustomError extends Error {
  constructor(
    public name,
    public message,
    public payload?: Object,
  ) {
    super(message);
  }
}
