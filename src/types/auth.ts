export type UserRole = "admin" | "user";

export interface PublicUser {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  accessKey: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const EMAIL_PATTERN = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
export const EMAIL_REGEX = new RegExp(EMAIL_PATTERN);
