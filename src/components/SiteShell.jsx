"use client";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import RegisterForm from "@/components/RegisterForm";

const BRAND = "#FAA896";

export default function SiteShell({ children }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        documentNumber: "",
    });

    const isValid = useMemo(() => {
        const onlyLetters = (v) => /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/.test(v.trim());
        const firstOk = form.firstName.trim().length >= 2 && onlyLetters(form.firstName);
        const lastOk = form.lastName.trim().length >= 2 && onlyLetters(form.lastName);
        const emailOk = /.+@.+\..+/.test(form.email);
        const digits = (form.documentNumber || "").replace(/\D/g, "");
        const docOk = digits.length >= 7 && digits.length <= 10;
        return firstOk && lastOk && emailOk && docOk;
    }, [form]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!isValid) return;
        try {
            setLoading(true);
            setOpen(false);
            alert("¡Gracias! Guardaremos tu solicitud cuando activemos el backend.");
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div className="relative min-h-screen text-white" style={{ ["--brand"]: BRAND }}>
                <NavBar />
                {children}
                <Footer />
            </div>

            <DialogContent className="sm:max-w-[720px]">
                <DialogHeader>
                    <DialogTitle>Solicitud de registro</DialogTitle>
                </DialogHeader>
                <RegisterForm
                    form={form}
                    setForm={setForm}
                    isValid={isValid}
                    loading={loading}
                    setOpen={setOpen}
                    onSubmit={handleSubmit}
                />
            </DialogContent>
        </Dialog>
    );
}
