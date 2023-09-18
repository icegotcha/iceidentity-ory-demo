export class ResponseError extends Error {
  constructor(message: string, status = 500) {
    super(message)
    this.status = status
  }

  status?: number
}
