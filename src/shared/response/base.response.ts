export class ApiResponse {
  public constructor(
    public code: number,
    public message: string,
    public data: any,
    public success: boolean = false,
    public time = new Date(),
  ) {}

  static Success(data: any = null) {
    return new ApiResponse(200, 'Success', data, true);
  }
  static NotFound(message: string) {
    return new ApiResponse(404, message, false);
  }

  static Conflict(message: string) {
    return new ApiResponse(409, message, false);
  }
  static Validation(message: string) {
    return new ApiResponse(422, message, false);
  }
}
