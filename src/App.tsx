import './App.css'
import LoginPage from "./pages/LoginPage.tsx"
import DashboardPage from "./pages/DashboardPage.tsx";
import ClientsPage from "./pages/client/ClientPage.tsx";
import ClientProfilePage from "./pages/client/ClientProfilePage.tsx";
import ProviderProfilePage from "./pages/provider/ProviderProfilePage.tsx";
import ProviderPage from "./pages/provider/ProviderPage.tsx";


function App() {
    const path = window.location.pathname;
    if (path === "/dashboard") return <DashboardPage />;
    if (path === "/clients") return <ClientsPage />;
    if (path.startsWith("/clients/")) return <ClientProfilePage />;
    if (path.startsWith("/providers/")) return <ProviderProfilePage />;
    if (path === "/providers") return <ProviderPage />;

    return <LoginPage />
}

export default App