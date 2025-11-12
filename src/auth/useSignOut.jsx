import { useCallback, useMemo, useState } from "react";
import { useAuth } from "react-oidc-context";

const DEFAULT_CLIENT_ID = "1lvdmpmv6mk114gdelmn0ol8co";
const DEFAULT_APP_URL = "http://localhost:5173";
const DEFAULT_COGNITO_DOMAIN =
  "https://us-east-2bws3t9vwm.auth.us-east-2.amazoncognito.com";
const DEFAULT_END_SESSION_ENDPOINT = `${DEFAULT_COGNITO_DOMAIN}/logout`;

const buildLogoutUrl = ({
  clientId,
  redirectUri,
  endSessionEndpoint,
  idToken,
}) => {
  const urlCandidate = endSessionEndpoint || DEFAULT_END_SESSION_ENDPOINT;

  try {
    const url = new URL(urlCandidate);

    if (clientId) {
      url.searchParams.set("client_id", clientId);
    }

    if (redirectUri) {
      url.searchParams.set("logout_uri", redirectUri);
      // Maintain compatibility with generic OIDC providers.
      url.searchParams.set("post_logout_redirect_uri", redirectUri);
    }

    if (idToken) {
      url.searchParams.set("id_token_hint", idToken);
    }

    return url.toString();
  } catch (error) {
    const safeClientId = encodeURIComponent(clientId || DEFAULT_CLIENT_ID);
    const safeRedirectUri = encodeURIComponent(redirectUri || DEFAULT_APP_URL);
    const baseUrl = `${DEFAULT_END_SESSION_ENDPOINT}?client_id=${safeClientId}&logout_uri=${safeRedirectUri}&post_logout_redirect_uri=${safeRedirectUri}`;
    if (idToken) {
      return `${baseUrl}&id_token_hint=${encodeURIComponent(idToken)}`;
    }
    return baseUrl;
  }
};

export const useSignOut = () => {
  const auth = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(null);

  const logoutParams = useMemo(() => {
    const settings = auth?.settings;

    return {
      clientId: settings?.client_id || DEFAULT_CLIENT_ID,
      redirectUri:
        settings?.post_logout_redirect_uri ||
        settings?.redirect_uri ||
        DEFAULT_APP_URL,
      endSessionEndpoint:
        settings?.metadata?.end_session_endpoint || DEFAULT_END_SESSION_ENDPOINT,
      idToken: auth?.user?.id_token ?? null,
    };
  }, [auth?.settings, auth?.user?.id_token]);

  const logoutUrl = useMemo(() => {
    return buildLogoutUrl(logoutParams);
  }, [logoutParams]);

  const signOut = useCallback(async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    setSignOutError(null);

    const clearLocalSession = async () => {
      if (typeof auth?.removeUser === "function") {
        await auth.removeUser();
      }

      if (typeof auth?.clearStaleState === "function") {
        await auth.clearStaleState();
      }
    };

    try {
      if (typeof auth?.signoutRedirect === "function") {
        await auth.signoutRedirect({
          post_logout_redirect_uri: logoutParams.redirectUri,
          id_token_hint: logoutParams.idToken ?? undefined,
          client_id: logoutParams.clientId,
          extraQueryParams: {
            logout_uri: logoutParams.redirectUri,
          },
        });
        await clearLocalSession().catch(() => {});
        return;
      }

      throw new Error("signoutRedirect no está disponible");
    } catch (error) {
      await clearLocalSession().catch(() => {});
      setSignOutError(
        error instanceof Error ? error : new Error("Error al cerrar sesión")
      );
      if (typeof window !== "undefined") {
        window.location.assign(logoutUrl);
      }
    } finally {
      setIsSigningOut(false);
    }
  }, [auth, isSigningOut, logoutParams, logoutUrl]);

  return {
    signOut,
    isSigningOut,
    error: signOutError,
  };
};

