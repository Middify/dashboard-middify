// index.js
import "../main.css";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import { BrowserRouter } from "react-router-dom";

const COGNITO_DOMAIN = "https://us-east-2bws3t9vwm.auth.us-east-2.amazoncognito.com";
const APP_URL = "http://localhost:5173";

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
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>
);