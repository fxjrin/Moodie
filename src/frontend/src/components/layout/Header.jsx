import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Header({ isAuthenticated, onLogin }) {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 backdrop-blur-sm">
            <div className="px-2 sm:px-4 w-full h-16 flex items-center justify-between">
                {/* Sidebar Trigger + Logo */}
                <div className="flex items-center gap-3">
                    <SidebarTrigger className="p-2 hover:bg-muted rounded-md cursor-pointer" />
                    <Link to="/" className="text-xl font-bold cursor-default">
                        <img
                            src='./logo.png'
                            alt="Logo"
                            className="h-8 w-auto object-contain"
                        />
                    </Link>
                </div>

                {/* Login Button */}
                <div>
                    {!isAuthenticated && (
                        <Button onClick={onLogin}>Login</Button>
                    )}
                </div>
            </div>
        </header>
    );
}
