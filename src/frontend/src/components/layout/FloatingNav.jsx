import React, { useState } from "react";
import { Home, MessageSquareText, ScanLine, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export default function FloatingNav({ isAuthenticated, onLogin }) {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);

    const navItems = [
        { name: "Home", icon: Home, path: "/" },
        { name: "Chat", icon: MessageSquareText, path: "/chat" },
        { name: "Scan", icon: ScanLine, path: "/scan" },
        { name: "Journal", icon: BookOpen, path: "/journal" },
        { name: "Profile", icon: User, path: "/profile" },
    ];

    function handleNavClick(path) {
        if (!isAuthenticated && (path === "/chat" || path === "/scan" || path === "/journal" || path === "/profile")) {
            setOpen(true);
            return;
        }
        navigate(path);
    }

    function handleLogin() {
        setOpen(false);
        if (typeof onLogin === "function") {
            onLogin();
        }
    }

    return (
        <>
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg rounded-full px-2 py-2 flex gap-6 sm:gap-2 z-50 backdrop-blur-sm">
                {navItems.map(({ name, icon: Icon, path }) => {
                    const isActive = pathname === path;

                    return (
                        <button
                            key={name}
                            onClick={() => handleNavClick(path)}
                            className={cn(
                                "flex items-center sm:gap-2 gap-0 px-2 sm:px-3 py-2 rounded-full transition-all text-sm font-medium",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="hidden sm:inline">{name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Drawer Login */}
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerContent>
                    <DrawerHeader className="text-center">
                        <DrawerTitle>Login Required</DrawerTitle>
                        <DrawerDescription>
                            Please log in to access this page.
                        </DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter className="justify-center">
                        <Button onClick={handleLogin} variant="default" className="w-full sm:w-auto">
                            Login
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}
