"use client";
import React, { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterForm({ onClose }) {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        role: "",
        diet: "Ninguna",
        dietOther: "",
    });
    const [loading, setLoading] = useState(false);
    const [alreadyRegistered, setAlreadyRegistered] = useState(false);

    const onlyLetters = (v) => /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/.test(v.trim());

    const isValid = useMemo(() => {
        const firstOk = form.firstName.trim().length >= 2 && onlyLetters(form.firstName);
        const lastOk = form.lastName.trim().length >= 2 && onlyLetters(form.lastName);
        const emailOk = /.+@.+\..+/.test(form.email);
        const phoneOk = form.phone.replace(/\D/g, "").length >= 6;
        const companyOk = form.company.trim().length >= 2; // obligatorio
        const roleOk = form.role.trim().length >= 2;       // obligatorio
        const dietOk = form.diet !== "Otro" ? !!form.diet : form.dietOther.trim().length >= 2;
        return firstOk && lastOk && emailOk && phoneOk && companyOk && roleOk && dietOk;
    }, [form]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!isValid || loading) return;

        setLoading(true);
        setAlreadyRegistered(false);

        try {
            const res = await fetch("/api/registrations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: form.firstName,
                    last_name: form.lastName,
                    email: form.email,
                    phone: form.phone,
                    company: form.company,
                    role: form.role,
                    diet: form.diet === "Otro" ? form.dietOther : form.diet,
                }),
            });

            const json = await res.json().catch(() => null);

            if (res.status === 409 || json?.exists || /duplicate/i.test(json?.message || "")) {
                // caso duplicado -> mantener formulario abierto
                setAlreadyRegistered(true);
                return;
            }

            if (res.ok) {
                // éxito -> avisar y cerrar
                alert("¡Registro recibido! Tu invitación está pendiente. Te avisaremos por email.");
                onClose?.(); // cerrar modal
                return;
            }

            console.error("Server error:", json);
            alert("No se pudo completar el registro. Intentalo de nuevo.");
        } catch (err) {
            console.error("Network error:", err);
            alert("Error de conexión. Revisá tu red e intentá nuevamente.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="relative rounded-2xl border border-white/10 bg-[rgba(15,15,16,0.6)] backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.35)] p-5 md:p-6 text-white"
            style={{ ["--brand"]: "#FAA896" }}
        >
            <h3 className="text-white font-semibold leading-tight mb-1">Inscripción al evento</h3>
            <p className="text-xs text-white/60 mb-4">Todos los campos son obligatorios</p>

            {alreadyRegistered && (
                <div className="mb-4 rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
                    Ya tenemos un registro con ese email o teléfono.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label className="text-white/90">Nombre *</Label>
                    <Input
                        required
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        placeholder="Ej: Ana"
                        className="mt-1 bg-[#121315] text-white placeholder:text-white/40 border-white/10 focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                    />
                </div>

                <div>
                    <Label className="text-white/90">Apellido *</Label>
                    <Input
                        required
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
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="tu@email.com"
                        className="mt-1 bg-[#121315] text-white placeholder:text-white/40 border-white/10 focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                    />
                </div>

                <div className="md:col-span-2">
                    <Label className="text-white/90">Teléfono *</Label>
                    <Input
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+54 9 351 123 4567"
                        className="mt-1 bg-[#121315] text-white placeholder:text-white/40 border-white/10 focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                    />
                    <p className="mt-1 text-xs text-white/50">Incluí prefijo. Ej: +54 9 ...</p>
                </div>

                <div>
                    <Label className="text-white/90">Empresa *</Label>
                    <Input
                        required
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        placeholder="Nombre de la empresa"
                        className="mt-1 bg-[#121315] text-white placeholder:text-white/40 border-white/10 focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                    />
                </div>

                <div>
                    <Label className="text-white/90">Puesto *</Label>
                    <Input
                        required
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        placeholder="Ej: Gerente de Operaciones"
                        className="mt-1 bg-[#121315] text-white placeholder:text-white/40 border-white/10 focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                    />
                </div>
            </div>

            <div className="mt-4">
                <Label className="text-white/90 block mb-2">Restricciones alimentarias *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {["Ninguna", "Vegetariano", "Vegano", "Libre de gluten", "Otro"].map((opt) => (
                        <label
                            key={opt}
                            className={[
                                "flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer",
                                form.diet === opt ? "border-[var(--brand)] bg-white/5" : "border-white/10 hover:border-white/20",
                            ].join(" ")}
                        >
                            <input
                                type="radio"
                                name="diet"
                                value={opt}
                                checked={form.diet === opt}
                                onChange={() => setForm({ ...form, diet: opt })}
                                className="accent-[var(--brand)]"
                                required
                            />
                            <span className="text-sm">{opt}</span>
                        </label>
                    ))}
                </div>

                {form.diet === "Otro" && (
                    <div className="mt-3">
                        <Label className="text-white/90">Especificá *</Label>
                        <Input
                            required
                            value={form.dietOther}
                            onChange={(e) => setForm({ ...form, dietOther: e.target.value })}
                            placeholder="Detalle de la restricción"
                            className="mt-1 bg-[#121315] text-white placeholder:text-white/40 border-white/10 focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                        />
                    </div>
                )}
            </div>

            <div className="mt-5 flex justify-end">
                <Button
                    type="submit"
                    disabled={!isValid || loading}
                    className="gap-2 bg-[var(--brand)] text-black hover:opacity-90 disabled:opacity-60"
                >
                    {loading ? "Enviando..." : "Inscribirme"}
                </Button>
            </div>
        </form>
    );
}
