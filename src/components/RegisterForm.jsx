"use client";
import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    diet: "Ninguna",
    dietOther: "",
};

const DIETS = ["Ninguna", "Vegetariano", "Vegano", "Libre de gluten", "Otro"];

export default function RegisterForm() {
    const [form, setForm] = useState(initial);
    const [loading, setLoading] = useState(false);
    const [alreadyRegistered, setAlreadyRegistered] = useState(false);
    const [success, setSuccess] = useState(false);

    const isValid = useMemo(() => {
        const emailOk = /.+@.+\..+/.test(form.email);
        const nameOk =
            form.firstName.trim().length >= 2 && form.lastName.trim().length >= 2;
        const phoneOk = form.phone.trim().length >= 6;
        const dietOk = !!form.diet && (form.diet !== "Otro" || form.dietOther.trim().length > 0);
        return emailOk && nameOk && phoneOk && dietOk;
    }, [form]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!isValid || loading) return;

        setLoading(true);
        setAlreadyRegistered(false);
        setSuccess(false);

        try {
            const res = await fetch("/api/registrations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: form.firstName,
                    last_name: form.lastName,
                    email: form.email,
                    phone: form.phone,
                    company: form.company || null,
                    role: form.role || null,
                    diet: form.diet === "Otro" ? form.dietOther : form.diet,
                }),
            });

            const json = await res.json().catch(() => null);

            if (res.status === 409 || json?.code === "23505" || /duplicate/i.test(json?.message || "")) {
                setAlreadyRegistered(true);
            } else if (res.ok) {
                setSuccess(true);
                setForm(initial);
            } else {
                console.error("Server error:", json);
                alert("No se pudo completar el registro. Intentalo de nuevo.");
            }
        } catch (err) {
            console.error("Network error:", err);
            alert("Error de conexión. Revisá tu red e intentá nuevamente.");
        } finally {
            setLoading(false);
        }
    }

    // Éxito
    if (success) {
        return (
            <div className="text-center p-6 bg-[rgba(15,15,16,0.6)] backdrop-blur-md rounded-2xl border border-white/10 text-white">
                <h2 className="text-2xl font-semibold mb-2">¡Registro recibido!</h2>
                <p className="text-white/70 mb-5">
                    Tu invitación está <b>pendiente</b>. Te avisaremos por email cuando sea confirmada.
                </p>
                <Button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="bg-[var(--brand)] text-black hover:opacity-90"
                >
                    Registrar otra persona
                </Button>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="relative rounded-2xl border border-white/10 bg-[rgba(15,15,16,0.6)] backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.35)] p-5 md:p-6 text-white"
            style={{ ["--brand"]: "#FAA896" }}
        >
            <div className="mb-4">
                <h3 className="text-white font-semibold leading-tight">Inscripción al evento</h3>
                <p className="text-xs text-white/60">Completá tus datos y te contactamos por email.</p>
            </div>

            {alreadyRegistered && (
                <div className="mb-4 rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
                    Ya tenemos un registro con ese email/teléfono.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label className="text-white/90">Nombre *</Label>
                    <Input
                        required
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        placeholder="Juan"
                        className="mt-1 bg-[#121315] text-white placeholder:text-white/40 border-white/10 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-0"
                    />
                </div>

                <div>
                    <Label className="text-white/90">Apellido *</Label>
                    <Input
                        required
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        placeholder="Pérez"
                        className="mt-1 bg-[#121315] text-white placeholder:text-white/40 border-white/10 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-0"
                    />
                </div>

                <div>
                    <Label className="text-white/90">Correo electrónico *</Label>
                    <Input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="correo@ejemplo.com"
                        className="mt-1 bg-[#121315] text-white placeholder:text-white/40 border-white/10 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-0"
                    />
                </div>

                <div>
                    <Label className="text-white/90">Teléfono *</Label>
                    <Input
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+54 9 351 123 4567"
                        className="mt-1 bg-[#121315] text-white placeholder:text-white/40 border-white/10 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-0"
                    />
                    <p className="mt-1 text-xs text-white/50">Incluí prefijo. Ej: +54 9 ...</p>
                </div>

                <div>
                    <Label className="text-white/90">Empresa</Label>
                    <Input
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        placeholder="(opcional)"
                        className="mt-1 bg-[#121315] text-white placeholder:text-white/40 border-white/10 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-0"
                    />
                </div>

                <div>
                    <Label className="text-white/90">Puesto</Label>
                    <Input
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        placeholder="(opcional)"
                        className="mt-1 bg-[#121315] text-white placeholder:text-white/40 border-white/10 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-0"
                    />
                </div>
            </div>

            <div className="mt-4">
                <Label className="text-white/90 block mb-2">Restricciones alimentarias *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DIETS.map((opt) => (
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
                            className="mt-1 bg-[#121315] text-white placeholder:text-white/40 border-white/10 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-0"
                        />
                    </div>
                )}
            </div>

            <div className="mt-5 md:mt-6 flex justify-end">
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
