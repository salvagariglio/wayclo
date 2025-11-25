"use client";

import { useMemo, useState, useEffect } from "react";
import Script from "next/script";

export default function RegisterForm({ onSuccess, onClose }) {
  // Argentina E.164 típico: +54 9 + área + número
  const PHONE_PREFIX = "+54 9 ";

  const [form, setForm] = useState({
    name: "",
    lastname: "",
    email: "",
    phoneRest: "",
    empresa: "",
    puesto: "",
    dietas: [],
    dietaOtro: "",
  });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  // --- NUEVO: estado captcha ---
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  // --- Turnstile callback global (recibe el token) ---
  useEffect(() => {
    // @ts-ignore
    window.onTurnstileVerified = (token) => {
      setCaptchaToken(token || "");
      setCaptchaError("");
    };
    // opcional: limpieza
    return () => {
      // @ts-ignore
      delete window.onTurnstileVerified;
    };
  }, []);

  const DIET_BASE = [
    { value: "celiaco", label: "Celíaco" },
    { value: "diabetico", label: "Diabético" },
    { value: "ninguno", label: "Ninguno" },
    { value: "vegano", label: "Vegano" },
    { value: "vegetariano", label: "Vegetariano" },
    { value: "otro", label: "Otro" }, // último siempre
  ];
  const DIET_OPTIONS = useMemo(() => {
    const other = DIET_BASE.find((d) => d.value === "otro");
    const rest = DIET_BASE.filter((d) => d.value !== "otro").sort((a, b) =>
      a.label.localeCompare(b.label, "es", { sensitivity: "base" })
    );
    return other ? [...rest, other] : rest;
  }, []);

  const onlyDigits = (s = "") => (s.match(/\d/g) || []).join("");

  const errors = useMemo(() => {
    const e = {};
    if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ' -]{2,}$/.test(form.name || ""))
      e.name = "Ingresá un nombre válido (2+ letras).";
    if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ' -]{2,}$/.test(form.lastname || ""))
      e.lastname = "Ingresá un apellido válido (2+ letras).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || ""))
      e.email = "Ingresá un email válido.";

    const digits = onlyDigits(form.phoneRest);
    if (digits.length < 8 || digits.length > 12)
      e.phoneRest = "Ingresá un teléfono válido (8–12 dígitos).";

    if (!form.empresa?.trim()) e.empresa = "Este campo es obligatorio.";
    if (!form.puesto?.trim()) e.puesto = "Este campo es obligatorio.";

    if (!form.dietas.length) e.dietas = "Seleccioná al menos una opción.";
    if (form.dietas.includes("otro") && !form.dietaOtro.trim())
      e.dietaOtro = "Especificá tu dieta.";

    return e;
  }, [form]);

  const hasErrors = Object.keys(errors).length > 0;

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleBlur = (e) =>
    setTouched((t) => ({ ...t, [e.target.name]: true }));

  const handlePhoneChange = (e) => {
    const v = e.target.value.replace(/[^\d()\s-]/g, "");
    setForm((f) => ({ ...f, phoneRest: v.replace(/\s{2,}/g, " ") }));
  };

  const toggleDiet = (val) => {
    setForm((f) => {
      const current = new Set(f.dietas);
      if (current.has(val)) {
        current.delete(val);
      } else {
        if (val === "ninguno") {
          return { ...f, dietas: ["ninguno"], dietaOtro: "" };
        }
        current.delete("ninguno");
        current.add(val);
      }
      const next = Array.from(current);
      return {
        ...f,
        dietas: next,
        dietaOtro: next.includes("otro") ? f.dietaOtro : "",
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      lastname: true,
      email: true,
      phoneRest: true,
      empresa: true,
      puesto: true,
      dietas: true,
      dietaOtro: true,
    });

    // --- NUEVO: exigir token captcha ---
    if (!captchaToken) {
      setCaptchaError("Por favor resolvé el verificado de seguridad.");
      return;
    }

    if (hasErrors) return;

    setLoading(true);

    // Mapeo a columnas reales de la tabla
    const payload = {
      first_name: form.name.trim(),
      last_name: form.lastname.trim(),
      email: form.email.trim(),
      phone: `${PHONE_PREFIX}${form.phoneRest}`.trim(),
      company: form.empresa.trim(),
      role: form.puesto.trim(),
      diet: form.dietas.join(","), // string
      diet_other: form.dietas.includes("otro") ? form.dietaOtro.trim() : null,
      status: "pending",

      // --- NUEVO: enviar token ---
      turnstileToken: captchaToken,
    };

    try {
      const res = await fetch("/api/admin/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const out = await res.json();
      if (!res.ok) {
        console.error("API error:", out);
        alert(out?.detail || out?.error || "No se pudo registrar.");
        setLoading(false);
        return;
      }
      setLoading(false);
      onSuccess?.(out); // { ok: true, id }
    } catch (err) {
      console.error(err);
      alert("Error inesperado. Intentá de nuevo.");
      setLoading(false);
    }
  };

  const inputClass = (invalid) =>
    [
      "mt-1 w-full rounded-md border px-3 py-2",
      "bg-white text-slate-900 placeholder:text-slate-400",
      "focus-visible:ring-2 focus-visible:ring-[var(--brand,#050057)] focus-visible:border-[var(--brand,#050057)]",
      invalid ? "border-rose-400" : "border-slate-300",
    ].join(" ");

  const pillClass = (active, invalid) =>
    [
      "block w-full h-10",
      "rounded-xl border text-sm text-center",
      "inline-flex items-center justify-center",
      "transition select-none",
      active
        ? "bg-[var(--brand,#050057)] text-white border-[var(--brand,#050057)] shadow-sm"
        : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50",
      invalid ? "ring-2 ring-rose-400 ring-offset-0" : "",
    ].join(" ");

  return (
    <form
      onSubmit={handleSubmit}
      className="relative rounded-xl bg-white text-slate-900 shadow-[0_10px_25px_rgba(0,0,0,0.12)] border border-slate-200 p-4 sm:p-6"
      style={{ ["--brand"]: "#050057" }}
      noValidate
    >
      {/* Script de Turnstile */}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />

      <h3 className="mb-1 text-slate-900 font-semibold leading-tight">
        Inscripción al evento
      </h3>
      <p className="mb-4 text-xs text-slate-500">
        Todos los campos son obligatorios
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nombre */}
        <div>
          <label className="text-sm">Nombre*</label>
          <input
            name="name"
            required
            minLength={2}
            pattern="^[A-Za-zÁÉÍÓÚÑáéíóúñ' -]{2,}$"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass(touched.name && !!errors.name)}
            aria-invalid={touched.name && !!errors.name}
            aria-describedby="err-name"
          />
          {touched.name && errors.name && (
            <p id="err-name" className="mt-1 text-xs text-rose-500">
              {errors.name}
            </p>
          )}
        </div>

        {/* Apellido */}
        <div>
          <label className="text-sm">Apellido*</label>
          <input
            name="lastname"
            required
            minLength={2}
            pattern="^[A-Za-zÁÉÍÓÚÑáéíóúñ' -]{2,}$"
            value={form.lastname}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass(touched.lastname && !!errors.lastname)}
            aria-invalid={touched.lastname && !!errors.lastname}
            aria-describedby="err-lastname"
          />
          {touched.lastname && errors.lastname && (
            <p id="err-lastname" className="mt-1 text-xs text-rose-500">
              {errors.lastname}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="text-sm">Email*</label>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass(touched.email && !!errors.email)}
            aria-invalid={touched.email && !!errors.email}
            aria-describedby="err-email"
          />
          {touched.email && errors.email && (
            <p id="err-email" className="mt-1 text-xs text-rose-500">
              {errors.email}
            </p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="text-sm">Teléfono*</label>
          <div className="flex gap-2">
            <input
              value={PHONE_PREFIX}
              readOnly
              className="mt-1 w-24 rounded-md border px-3 py-2 bg-slate-100 text-slate-500 border-slate-300"
              aria-label="Prefijo"
            />
            <input
              name="phoneRest"
              required
              value={form.phoneRest}
              onChange={handlePhoneChange}
              onBlur={handleBlur}
              placeholder="(351) 123-4567"
              className={inputClass(touched.phoneRest && !!errors.phoneRest)}
              aria-invalid={touched.phoneRest && !!errors.phoneRest}
              aria-describedby="err-phone"
            />
          </div>
          {touched.phoneRest && errors.phoneRest && (
            <p id="err-phone" className="mt-1 text-xs text-rose-500">
              {errors.phoneRest}
            </p>
          )}
        </div>

        {/* Empresa */}
        <div>
          <label className="text-sm">Empresa*</label>
          <input
            name="empresa"
            required
            value={form.empresa}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass(touched.empresa && !!errors.empresa)}
          />
          {touched.empresa && errors.empresa && (
            <p className="mt-1 text-xs text-rose-500">{errors.empresa}</p>
          )}
        </div>

        {/* Puesto */}
        <div>
          <label className="text-sm">Puesto*</label>
          <input
            name="puesto"
            required
            value={form.puesto}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass(touched.puesto && !!errors.puesto)}
          />
          {touched.puesto && errors.puesto && (
            <p className="mt-1 text-xs text-rose-500">{errors.puesto}</p>
          )}
        </div>

        {/* Dietas (multi) */}
        <div className="sm:col-span-2">
          <label className="text-sm">Preferencias de dieta*</label>
          <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DIET_OPTIONS.map((opt) => {
              const active = form.dietas.includes(opt.value);
              return (
                <label key={opt.value} className="cursor-pointer w-full">
                  <input
                    type="checkbox"
                    name="dietas"
                    value={opt.value}
                    checked={active}
                    onChange={() => toggleDiet(opt.value)}
                    onBlur={() => setTouched((t) => ({ ...t, dietas: true }))}
                    className="sr-only peer"
                  />
                  <span
                    role="button"
                    aria-pressed={active}
                    className={pillClass(
                      active,
                      touched.dietas && !!errors.dietas
                    )}
                  >
                    {opt.label}
                  </span>
                </label>
              );
            })}
          </div>

          {touched.dietas && errors.dietas && (
            <p className="mt-1 text-xs text-rose-500">{errors.dietas}</p>
          )}

          {/* Campo "Otro" */}
          {form.dietas.includes("otro") && (
            <div className="mt-2">
              <input
                name="dietaOtro"
                placeholder="Especificá tu dieta"
                value={form.dietaOtro}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClass(touched.dietaOtro && !!errors.dietaOtro)}
                aria-invalid={touched.dietaOtro && !!errors.dietaOtro}
                aria-describedby="err-dietaOtro"
              />
              {touched.dietaOtro && errors.dietaOtro && (
                <p id="err-dietaOtro" className="mt-1 text-xs text-rose-500">
                  {errors.dietaOtro}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- NUEVO: Widget Turnstile --- */}
      <div className="mt-4">
        <div
          className="cf-turnstile"
          data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          data-callback="onTurnstileVerified"
          data-theme="light"
        />
        {captchaError && (
          <p className="mt-1 text-xs text-rose-500">{captchaError}</p>
        )}
      </div>

      {/* Botones */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 rounded-md bg-[var(--brand,#050057)] text-white font-semibold hover:opacity-90 disabled:opacity-60 transition"
        >
          {loading ? "Enviando..." : "Enviar registro"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="py-3 px-4 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
