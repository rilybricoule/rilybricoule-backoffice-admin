import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, type ReactNode } from "react";

import { setNavigator, navigateFromAnywhere } from "./api/navigationbridge.ts";
import { clearAuth } from "./api/api";
import { validateToken } from "./api/auth";
import { startForceLogoutRealtime, stopForceLogoutRealtime } from "./api/forceLogoutRealTime.ts";

import ProtectedRoute from "./components/ProtectedRoute";
import PermissionRoute from "./components/PermessionRoute.tsx";
import { routePermissionMap } from "./auth/routePermissionMap";
import MarketingPage from "./pages/marketing/MarketingPage";


import DashboardPage from "./pages/dashboard/DashboardPage";
import ClientsPage from "./pages/client/ClientPage";
import ClientProfilePage from "./pages/client/ClientProfilePage";
import ProviderPage from "./pages/provider/ProviderPage";
import ProviderProfilePage from "./pages/provider/ProviderProfilePage";
import CategoriesPage from "./pages/categories/CategoriesPage";
import OffresPage from "./pages/offres/OffresPage";
import ReservationsPage from "./pages/reservation/Reservationspage";
import PromoPage from "./pages/marketing/promo/PromoPage";
import SupportPage from "./pages/support/SupportPage";
import ContentPage from "./pages/content/ContentPage";
import SecurityPage from "./pages/security/SecurityPage";
import PaymentsPage from "./pages/Transaction/PaymentsPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import ParametresPage from "./pages/parametre/Parametrepage";
import VersionsPage from "./pages/version/VersionsPage";
import AdminProfilePage from "./pages/profile/AdminProfilePage";

import LoginPage from "./pages/LoginPage";
import Login2FAPage from "./pages/Login2FAPage.tsx";
import ChangePasswordRequiredPage from "./pages/ChangePasswordRequiredPage";
import TwoFASetupPage from "./pages/TwoFASetupPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

import ChatBoxStack from "./pages/message/Chatbox";

import { CategoriesProvider } from "./pages/context/CategoriesContext";
import { ProvidersProvider } from "./pages/context/ProviderContext";
import { OffresProvider } from "./pages/context/OffresContext";
import { ReservationsProvider } from "./pages/context/Reservationcontext";
import { MessagesProvider } from "./pages/context/MessagesContext";
import { TransactionsProvider } from "./pages/context/TransactionsContext";
import { PromoProvider } from "./pages/context/PromoContext";
import { NotificationsProvider } from "./pages/context/NotificationsContext";
import { SupportProvider } from "./pages/context/SupportContext";
import { SecurityProvider } from "./pages/context/SecurityContext";

import "./App.css";

function NavigationRegistrar() {
    const navigate = useNavigate();

    useEffect(() => {
        setNavigator(navigate);
    }, [navigate]);

    return null;
}

function RP({
                path,
                children,
            }: {
    path: keyof typeof routePermissionMap;
    children: ReactNode;
}) {
    const required = routePermissionMap[path];
    if (!required) return <>{children}</>;
    return <PermissionRoute required={required}>{children}</PermissionRoute>;
}

function P({ children }: { children: ReactNode }) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
    useEffect(() => {
        startForceLogoutRealtime();
        return () => {
            stopForceLogoutRealtime();
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            const hasToken =
                !!localStorage.getItem("accessToken") ||
                !!sessionStorage.getItem("accessToken");

            if (!hasToken) return;

            try {
                const ok = await validateToken();
                if (!ok && !cancelled) {
                    clearAuth();
                    navigateFromAnywhere("/");
                }
            } catch {
                if (!cancelled) {
                    clearAuth();
                    navigateFromAnywhere("/");
                }
            }
        };

        run();
        const id = window.setInterval(run, 5000);

        return () => {
            cancelled = true;
            window.clearInterval(id);
        };
    }, []);

    return (
        <BrowserRouter>
            <NavigationRegistrar />

            <SecurityProvider>
                <ProvidersProvider>
                    <CategoriesProvider>
                        <OffresProvider>
                            <ReservationsProvider>
                                <MessagesProvider>
                                    <TransactionsProvider>
                                        <PromoProvider>
                                            <NotificationsProvider>
                                                <SupportProvider>
                                                        <Routes>
                                                            <Route path="/" element={<LoginPage />} />
                                                            <Route path="/forbidden" element={<UnauthorizedPage />} />
                                                            <Route path="/login-2fa" element={<Login2FAPage />} />
                                                            <Route
                                                                path="/change-password-required"
                                                                element={<ChangePasswordRequiredPage />}
                                                            />
                                                            <Route
                                                                path="/dashboard"
                                                                element={
                                                                    <P>
                                                                        <RP path="/dashboard">
                                                                            <DashboardPage />
                                                                        </RP>
                                                                    </P>
                                                                }
                                                            />
                                                            <Route
                                                                path="/clients"
                                                                element={
                                                                    <P>
                                                                        <RP path="/clients">
                                                                            <ClientsPage />
                                                                        </RP>
                                                                    </P>
                                                                }
                                                            />
                                                            <Route
                                                                path="/clients/:id"
                                                                element={
                                                                    <P>
                                                                        <RP path="/clients/:id">
                                                                            <ClientProfilePage />
                                                                        </RP>
                                                                    </P>
                                                                }
                                                            />
                                                            <Route
                                                                path="/providers"
                                                                element={
                                                                    <P>
                                                                        <RP path="/providers">
                                                                            <ProviderPage />
                                                                        </RP>
                                                                    </P>
                                                                }
                                                            />
                                                            <Route
                                                                path="/providers/:id"
                                                                element={
                                                                    <P>
                                                                        <RP path="/providers/:id">
                                                                            <ProviderProfilePage />
                                                                        </RP>
                                                                    </P>
                                                                }
                                                            />
                                                            <Route
                                                                path="/categories"
                                                                element={
                                                                    <P>
                                                                        <RP path="/categories">
                                                                            <CategoriesPage />
                                                                        </RP>
                                                                    </P>
                                                                }
                                                            />
                                                            <Route
                                                                path="/offers"
                                                                element={
                                                                    <P>
                                                                        <RP path="/offers">
                                                                            <OffresPage />
                                                                        </RP>
                                                                    </P>
                                                                }
                                                            />
                                                            <Route
                                                                path="/reservations"
                                                                element={
                                                                    <P>
                                                                        <RP path="/reservations">
                                                                            <ReservationsPage />
                                                                        </RP>
                                                                    </P>
                                                                }
                                                            />
                                                            <Route
                                                                path="/payments"
                                                                element={
                                                                    <P>
                                                                        <RP path="/payments">
                                                                            <PaymentsPage />
                                                                        </RP>
                                                                    </P>
                                                                }
                                                            />
                                                            <Route
                                                                path="/marketing"
                                                                element={
                                                                    <P>
                                                                        <RP path="/marketing">
                                                                            <MarketingPage />
                                                                        </RP>
                                                                    </P>
                                                                }
                                                            />

                                                            <Route
                                                                path="/promo"
                                                                element={
                                                                    <P>
                                                                        <RP path="/promo">
                                                                            <PromoPage />
                                                                        </RP>
                                                                    </P>
                                                                }
                                                            />
                                                            <Route
                                                                path="/notifications"
                                                                element={
                                                                    <P>
                                                                        <RP path="/notifications">
                                                                            <NotificationsPage />
                                                                        </RP>
                                                                    </P>
                                                                }
                                                            />
                                                            <Route
                                                                path="/support"
                                                                element={
                                                                    <P>
                                                                        <RP path="/support">
                                                                            <SupportPage />
                                                                        </RP>
                                                                    </P>
                                                                }
                                                            />
                                                            <Route
                                                                path="/content"
                                                                element={
                                                                    <P>
                                                                        <RP path="/content">
                                                                            <ContentPage />
                                                                        </RP>
                                                                    </P>
                                                                }
                                                            />
                                                            <Route
                                                                path="/security"
                                                                element={
                                                                    <P>
                                                                        <RP path="/security">
                                                                            <SecurityPage />
                                                                        </RP>
                                                                    </P>
                                                                }
                                                            />
                                                            <Route
                                                                path="/settings"
                                                                element={
                                                                    <P>
                                                                        <RP path="/settings">
                                                                            <ParametresPage />
                                                                        </RP>
                                                                    </P>
                                                                }
                                                            />
                                                            <Route
                                                                path="/version"
                                                                element={
                                                                    <P>
                                                                        <RP path="/version">
                                                                            <VersionsPage />
                                                                        </RP>
                                                                    </P>
                                                                }
                                                            />

                                                            <Route
                                                                path="/profile"
                                                                element={
                                                                    <P>
                                                                        <AdminProfilePage />
                                                                    </P>
                                                                }
                                                            />
                                                            <Route
                                                                path="/settings/2fa"
                                                                element={
                                                                    <P>
                                                                        <TwoFASetupPage />
                                                                    </P>
                                                                }
                                                            />
                                                        </Routes>

                                                        <ChatBoxStack />
                                                </SupportProvider>
                                            </NotificationsProvider>
                                        </PromoProvider>
                                    </TransactionsProvider>
                                </MessagesProvider>
                            </ReservationsProvider>
                        </OffresProvider>
                    </CategoriesProvider>
                </ProvidersProvider>
            </SecurityProvider>
        </BrowserRouter>
    );
}
