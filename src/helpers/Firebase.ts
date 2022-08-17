import { AuthError, AuthErrorCodes } from "firebase/auth";

export const getAuthErrorMessage = (e: AuthError): string => {
  console.log(e.code);
  switch (e.code) {
    case AuthErrorCodes.EMAIL_EXISTS:
      return "The provided email is already linked to an account. Try a different email or log into your account.";
    case AuthErrorCodes.INVALID_EMAIL:
      return "Please provide a valid email address.";
    case AuthErrorCodes.INVALID_PASSWORD:
      return "Invalid password. Please try again.";
    case AuthErrorCodes.USER_DELETED:
      return "Could not find an account with that email. Try creating an account instead.";
    default:
      return "Something went wrong. Please try again later.";
  }
}