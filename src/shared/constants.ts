export const accessTokenOptions = {
  httpOnly: true,
  path: "/",
  overwrite: true,
  sameSite: "None",
  secure: true,
};

export const refreshTokenOptions = {
  httpOnly: true,
  path: "/users/refreshToken",
  overwrite: true,
  sameSite: "None",
  secure: true,
};

export interface IErrMsg extends Error {
  status?: number;
  httpStatusCode?: number;
  message: string;
}
