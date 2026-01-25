import { ref } from "vue";
import type { User } from "oidc-client-ts";
import { authManager, login as authLogin, logout as authLogout, handleCallback as authHandleCallback } from "../auth";

const user = ref<User | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

function isUserExpired(currentUser: User) {
  if (!currentUser.expires_at) return false;
  return currentUser.expires_at <= Math.floor(Date.now() / 1000);
}

// Initialize auth state
async function initAuth() {
    try {
        const currentUser = await authManager.getUser();
        if (currentUser && isUserExpired(currentUser)) {
            await authManager.removeUser();
            user.value = null;
        } else {
            user.value = currentUser;
        }
    } catch (err) {
        error.value = err instanceof Error ? err.message : "Failed to load session.";
    } finally {
        loading.value = false;
    }
}

// Event listeners
function onUserLoaded(loadedUser: User) {
    if (isUserExpired(loadedUser)) {
        authManager.removeUser().catch(() => undefined);
        user.value = null;
        return;
    }
    user.value = loadedUser;
    error.value = null;
}
function onUserUnloaded() {
    user.value = null;
}
function onAccessTokenExpired() {
    authManager.removeUser().catch(() => undefined);
    user.value = null;
}

// Setup listeners (once)
authManager.events.addUserLoaded(onUserLoaded);
authManager.events.addUserUnloaded(onUserUnloaded);
authManager.events.addAccessTokenExpired(onAccessTokenExpired);

// Start initialization
initAuth();

export function useAuth() {
  const login = async () => {
    error.value = null;
    await authLogin();
  };

  const logout = async () => {
    error.value = null;
    await authLogout();
  };

  const handleCallback = async () => {
    error.value = null;
    const signedInUser = await authHandleCallback();
    user.value = signedInUser;
    return signedInUser;
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    handleCallback
  };
}
