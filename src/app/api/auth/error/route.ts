// src/app/api/auth/error/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get("error");
  
  let errorMessage = "An unknown authentication error occurred";
  
  // Map common NextAuth errors to user-friendly messages
  if (error === "CredentialsSignin") {
    errorMessage = "Invalid email or password";
  } else if (error === "AccessDenied") {
    errorMessage = "Access denied";
  } else if (error === "OAuthSignin" || error === "OAuthCallback" || error === "OAuthCreateAccount") {
    errorMessage = "Error in OAuth authentication flow";
  } else if (error === "EmailCreateAccount") {
    errorMessage = "Error creating account with email provider";
  } else if (error === "Callback") {
    errorMessage = "Error during authentication callback";
  } else if (error === "OAuthAccountNotLinked") {
    errorMessage = "Email already used with a different provider";
  } else if (error === "EmailSignin") {
    errorMessage = "Error sending email sign-in link";
  } else if (error === "SessionRequired") {
    errorMessage = "Authentication required to access this resource";
  } else if (error === "Configuration") {
    errorMessage = "Authentication server misconfiguration";
  }
  
  return NextResponse.json({
    error: true,
    message: errorMessage,
    errorType: error
  });
}