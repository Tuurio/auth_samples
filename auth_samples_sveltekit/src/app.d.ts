declare global {
  namespace App {
    interface Locals {
      user: import('./lib/server/oidc').AuthenticatedUser | null;
    }
  }
}

export {};
