import { useAuth } from "react-oidc-context";
import Index from "./pages/index";

function App() {
  const auth = useAuth();

  if (auth.isLoading) return <div>Loading...</div>;
  if (auth.error) return <div>Error: {auth.error.message}</div>;

  if (auth.isAuthenticated) {
    const profile = auth.user?.profile;
    const role =
      profile?.["custom:role"] || profile?.["cognito:groups"]?.[0] || "User";

    const currentUser = {
      id: profile?.sub,
      email: profile?.email,
      role,
      tenantId: profile?.["custom:tenantId"] || null,
    };

    return <Index token={auth.user?.access_token} currentUser={currentUser} />;
  }

  auth.signinRedirect();
  return <div>Redirigiendo al login...</div>;
}

export default App;
