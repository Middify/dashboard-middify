// index.js
import "../main.css";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const COGNITO_DOMAIN = "https://us-east-2bws3t9vwm.auth.us-east-2.amazoncognito.com";
const APP_URL = window.location.origin;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de caché antes de considerar la data vieja
      retry: 1,
      refetchOnWindowFocus: false, // Evita recargas molestas al cambiar de ventana
    },
  },
});

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_BWs3t9VwM",
  client_id: "1lvdmpmv6mk114gdelmn0ol8co",
  redirect_uri: APP_URL,
  post_logout_redirect_uri: APP_URL,
  response_type: "code",
  scope: "aws.cognito.signin.user.admin email openid phone profile",
  signoutRedirectArgs: {
    post_logout_redirect_uri: APP_URL,
  },
  metadata: {
    end_session_endpoint: `${COGNITO_DOMAIN}/logout`,
    authorization_endpoint: `${COGNITO_DOMAIN}/oauth2/authorize`,
    token_endpoint: `${COGNITO_DOMAIN}/oauth2/token`,
  },
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <AuthProvider {...cognitoAuthConfig}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </AuthProvider>
);