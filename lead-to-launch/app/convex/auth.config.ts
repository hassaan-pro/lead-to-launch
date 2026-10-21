/**
 * Clerk is the auth provider. The domain is this app's Clerk instance
 * (public, it is the frontend API URL from the publishable key).
 * applicationID "convex" requires a JWT template named "convex" in the
 * Clerk dashboard, which the Clerk + Convex integration creates.
 */
export default {
  providers: [
    {
      domain: "https://artistic-sturgeon-70.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
