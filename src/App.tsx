import './App.css'
import LoginPage from "./pages/LoginPage.tsx"
import DashboardPage from "./pages/DashboardPage.tsx";


function App() {
    const path = window.location.pathname;
    if (path === "/dashboard") return <DashboardPage />;

    return <LoginPage />
}

export default App