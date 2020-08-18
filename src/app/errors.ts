export class AppError extends Error{
  public code: number;

  constructor(code: number, message?: string) {
    super(message || 'Oops! Something went wrong! Please try again!');
    this.code = code;
  }
};

export class NoInternetError extends AppError{
  constructor(message?: string) {
    super(0, message || 'Please check your network connection, then try again.');
  }
};

export class PIDError extends AppError{
  constructor(message?: string) {
    super(5566, message);
  }
};
