import { Outlet } from "react-router-dom"
import { useAuth } from "../hooks/useAuth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Header from "../components/layout/Header";
import FloatingNav from "../components/layout/FloatingNav";

const MainLayout = () => {
    const { user, isAuthenticated, isLoading: authLoading, handleLogin, handleLogout } = useAuth();

    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar user={user} onLogout={handleLogout}/>
            <SidebarInset>
                <Header
                    isAuthenticated={isAuthenticated}
                    onLogin={handleLogin}
                />

                <main className="flex flex-1 flex-col gap-4 p-4">
                    <Outlet context={{ user, isAuthenticated }} />
                </main>

                <FloatingNav
                    isAuthenticated={isAuthenticated} 
                    onLogin={handleLogin}
                />
            </SidebarInset>
        </SidebarProvider>
    );
};

export default MainLayout;