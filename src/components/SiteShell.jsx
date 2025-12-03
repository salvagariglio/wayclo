"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ChatBubble from "@/components/ChatBubble";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RegisterForm from "@/components/RegisterForm";

export default function SiteShell({ children }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("form");

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setMode("form"), 250);
  };

  useEffect(() => {
    const openFromEvent = () => setOpen(true);
    document.addEventListener("open-register", openFromEvent);

    if (typeof window !== "undefined" && window.location.hash === "#registro") {
      setOpen(true);
    }

    return () => document.removeEventListener("open-register", openFromEvent);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* 🔹 Navbar se oscurece cuando open = true */}
      <NavBar dimmed={open} />

      <main className="pt-24">{children}</main>

      <Footer />

      {/* 🟦 ChatBubble afectado por el estado del modal */}
      <ChatBubble dimmed={open} />

      {/* 🔸 Dialog de registro */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="
            sm:max-w-[720px]
            max-h-[90vh]
            overflow-y-auto
            p-0
            bg-white text-slate-900
            rounded-xl
          "
        >
          {mode === "form" && (
            <>
              <DialogHeader className="px-6 pt-6">
                <DialogTitle className="text-slate-900"></DialogTitle>
              </DialogHeader>

              <div className="p-4 sm:p-6">
                <RegisterForm
                  onSuccess={() => setMode("success")}
                  onClose={handleClose}
                />
              </div>
            </>
          )}

          {mode === "success" && (
            <>
              <DialogHeader className="px-6 pt-6">
                <DialogTitle className="text-slate-900">
                  Registro enviado
                </DialogTitle>
              </DialogHeader>

              <div className="p-6 text-slate-800 text-center">
                <p className="mb-4">
                  ¡Gracias! Tu inscripción fue enviada correctamente.
                </p>
                <button
                  onClick={handleClose}
                  className="
                    mt-4 px-6 py-3 rounded-md
                    bg-[#050057] text-white
                    hover:opacity-90 transition
                  "
                >
                  Cerrar
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
