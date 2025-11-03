"use client";
import React, { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Simulación temporal de “usuarios registrados”
const FAKE_DB = [
    { email: "ana@example.com", phone: "+54 9111111111", name: "Ana López" },
    { email: "juanperez@mail.com", phone: "+54 9222222222", name: "Juan Pérez" },
];

export default function RegisterForm() {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        role: "",
        diet: "ninguna",
        dietOther: "",
    });
    const [loading, setLoading] = useState(false);
    const [alreadyRegistered, setAlreadyRegistered] = useState(false);

    const onlyLetters = (v) => /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/.test(v.trim());

    // Validaciones
    const isValid = useMemo(() => {
        const firstOk = form.firstName.trim().length >= 2 && onlyLetters(form.firstName);
        const lastOk = form.lastName.trim().length >= 2 && onlyLetters(form.lastName);
        const emailOk = /.+@.+\..+/.test(form.email);
        const phoneOk = form.phone.replace(/\D/g, "").length >= 6;
        const companyOk = form.company.trim().length >= 2;
        const roleOk = form.role.trim().length >= 2;
        const dietOk =
            form.diet !== "otro" ? !!form.diet : form.dietOther.trim().length >= 2;
        return firstOk && lastOk && emailOk && phoneOk && companyOk && roleOk && dietOk;
    }, [form]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!isValid) return;
        setLoading(true);
        try {
            const res = await fetch("/api/registrations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    email: form.email,
                    phone: form.phone,
                    company: form.company,
                    role: form.role,
                    diet: form.diet,
                    dietOther: form.dietOther,
                }),
            });
            const json = await res.json();

            if (json.exists) {
                // ya estaba registrado por email/phone unique
                setAlreadyRegistered(true); // tu UI de “ya estás registrado”
                return;
            }
            if (!res.ok) throw new Error(json.error || "Error");

            // OK: mostrá “pendiente enviado”
            setSuccess(true); // muestra un “¡Registro recibido! Te llegará un email…”
        } finally {
            setLoading(false);
        }
    }


    // Si ya está registrado
    if (alreadyRegistered) {
        return (
            <div className="text-center p-6 bg-[rgba(15,15,16,0.6)] backdrop-blur-md rounded-2xl border border-white/10 text-white">
                <h2 className="text-2xl font-semibold mb-2">Ya estás registrado</h2>
                <p className="text-white/70 mb-4">
                    Nuestro sistema detectó que este email, número o nombre ya se encuentra registrado.
                </p>
                <Button
                    className="bg-[var(--brand)] text-black hover:opacity-90"
                    onClick={() => setAlreadyRegistered(false)}
                >
                    Registrar otro participante
                </Button>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="relative rounded-2xl border border-white/10 bg-[rgba(15,15,16,0.6)] backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.35)] p-5 md:p-6"
        >
            <h3 className="text-white font-semibold leading-tight mb-1">Inscripción</h3>
            <p className="text-xs text-white/60 mb-4">Todos los campos son obligatorios</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label className="text-white/90">Nombre *</Label>
                    <Input
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        placeholder="Ej: Ana"
                        className="mt-1 bg-[#121315] text-white placeholder:text-white/40 border-white/10 focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                    />
                </div>

                <div>
                    <Label className="text-white/90">Apellido *</Label>
                    <Input
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        placeholder="Ej: Pérez"
                        className="mt-1 bg-[#121315] text-white placeholder:text-white/40 border-white/10 focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                    />
                </div>

                <div className="md:col-span-2">
                    <Label className="text-white/90">Correo electrónico *</Label>
                    <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="tu@email.com"
                        className="mt-1 bg-[#121315] text-white placeholder:text-white/40 border-white/10 focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                    />
                </div>

                <div className="md:col-span-2">
                    <Label className="text-white/90">Teléfono *</Label>
                    <Input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+54 9 358 123 4567"
                        className="mt-1 bg-[#121315] text-white placeholder:text-white/40 border-white/10 focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                    />
                </div>

                <div>
                    <Label className="text-white/90">Empresa *</Label>
                    <Input
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        placeholder="Nombre de la empresa"
                        className="mt-1 bg-[#121315] text-white placeholder:text-white/40 border-white/10 focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                    />
                </div>

                <div>
                    <Label className="text-white/90">Puesto *</Label>
                    <Input
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        placeholder="Ej: Gerente de Operaciones"
                        className="mt-1 bg-[#121315] text-white placeholder:text-white/40 border-white/10 focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                    />
                </div>
            </div>

            <div className="mt-5 flex justify-end">
                <Button
                    type="submit"
                    disabled={!isValid || loading}
                    className="gap-2 bg-[var(--brand)] text-black hover:opacity-90 disabled:opacity-60"
                >
                    {loading ? "Verificando..." : "Enviar"}
                </Button>
            </div>
        </form>
    );
}
