export type User = {
  readonly id: string;
  readonly phone: string;
  readonly password: string;
  readonly createdAt: number;
};

export type Session = {
  readonly userId: string;
  readonly phone: string;
  readonly createdAt: number;
};

