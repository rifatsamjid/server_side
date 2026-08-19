export interface IAuthUser {
  id: number;
  name: string;
  email: string;
  role: "contributor" | "maintainer";
}
