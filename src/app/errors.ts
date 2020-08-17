export class AppErrors extends Error{
  public code: number;

  constructor(code, message) {
    super(message);
    this.code = code;
  }
};

export class NoInternetErrors extends AppErrors{
  constructor(code, message) {
    super(code, message);
  }
};

export class PIDErrors extends AppErrors{
  constructor(code, message) {
    super(code, message);
  }
};
