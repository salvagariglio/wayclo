"use client";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import RegisterForm from "@/components/RegisterForm";

function SuccessCard({ onClose }) {
    return (
        <div className="text-white">
            <div className="rounded-xl border border-white/10 bg-[rgba(15,15,16,0.7)] p-5 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10">
                    <span className="text-2xl">✅</span>
                </div>
                <h3 className="text-lg font-semibold">¡Registro recibido!</h3>
                <p className="mt-2 text-sm text-white/70">
                    Tu invitación quedó <b>pendiente</b>. Te avisaremos por email cuando sea
                    confirmada.
                </p>

                <button
                    onClick={onClose}
                    className="mt-4 inline-flex items-center rounded-md bg-[var(--brand)] px-4 py-2 font-medium text-black hover:opacity-90"
                >
                    Entendido
                </button>
            </div>
        </div>
    );
}

export default function SiteShell({ children }) {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState("form"); // "form" | "success"

    const handleClose = () => {
        setOpen(false);
        // restaurar al modo formulario para la próxima apertura
        setTimeout(() => setMode("form"), 200);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
            <div className="relative min-h-screen text-white">
                <NavBar />
                {children}
                <Footer />
            </div>

            {mode === "success" ? (
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>¡Listo!</DialogTitle>
                    </DialogHeader>
                    <SuccessCard onClose={handleClose} />
                </DialogContent>
            ) : (
                <DialogContent className="sm:max-w-[720px]">
                    <DialogHeader>
                        <DialogTitle>Solicitud de registro</DialogTitle>
                    </DialogHeader>
                    <RegisterForm
                        onSuccess={() => setMode("success")}
                        // si querés cerrar manualmente sin éxito, igual podés:
                        onClose={handleClose}
                    />
                </DialogContent>
            )}
        </Dialog>
    );
}
