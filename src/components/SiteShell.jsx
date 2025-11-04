"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import RegisterForm from "@/components/RegisterForm";

export default function SiteShell({ children }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div className="relative min-h-screen text-white">
                <NavBar />
                {children}
                <Footer />
            </div>

            <DialogContent className="sm:max-w-[720px]">
                <DialogHeader>
                    <DialogTitle>Solicitud de registro</DialogTitle>
                </DialogHeader>
                <RegisterForm onClose={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}
