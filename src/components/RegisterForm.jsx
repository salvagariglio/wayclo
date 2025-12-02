"use client";

import { useMemo, useState, useEffect } from "react";
import Script from "next/script";

export default function RegisterForm({ onSuccess, onClose }) {
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

  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  // errores del backend
  const [serverFieldErrors, setServerFieldErrors] = useState({});
  const [generalServerError, setGeneralServerError] = useState("");

  // NUEVO → solo mostrar errores después de que el usuario intenta enviar
  const [submitted, setSubmitted] = useState(false);

  // reset captcha
  useEffect(() => {
    if (typeof window !== "undefined" && window.turnstile) {
      window.turnstile.reset();
    }
  }, [onClose]);

  // captcha callback
  useEffect(() => {
    window.onTurnstileVerified = (token) => {
      setCaptchaToken(token || "");
      setCaptchaError("");
    };
    return () => {
      delete window.onTurnstileVerified;
    };
  }, []);

  const DIET_BASE = [
    { value: "celiaco", label: "Celíaco" },
    { value: "diabetico", label: "Diabético" },
    { value: "ninguno", label: "Ninguno" },
    { value: "vegano", label: "Vegano" },
    { value: "vegetariano", label: "Vegetariano" },
    { value: "otro", label: "Otro" },
  ];

  const DIET_OPTIONS = useMemo(() => {
    const other = DIET_BASE.find((d) => d.value === "otro");
    const rest = DIET_BASE.filter((d) => d.value !== "otro").sort((a, b) =>
      a.label.localeCompare(b.label, "es", { sensitivity: "base" })
    );
    return other ? [...rest, other] : rest;
  }, []);

  const onlyDigits = (s = "") => (s.match(/\d/g) || []).join("");

  // VALIDACIÓN LOCAL
  const localErrors = useMemo(() => {
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

    if (!form.empresa.trim())
      e.empresa = "Este campo es obligatorio.";

    if (!form.puesto.trim())
      e.puesto = "Este campo es obligatorio.";

    if (!form.dietas.length)
      e.dietas = "Seleccioná al menos una opción.";

    if (form.dietas.includes("otro") && !form.dietaOtro.trim())
      e.dietaOtro = "Especificá tu dieta.";

    return e;
  }, [form]);

  // Solo se muestran errores del server si el server mandó algo.  
  // Sino local.
  const mergedErrors =
    Object.keys(serverFieldErrors).length > 0
      ? serverFieldErrors
      : localErrors;

  const hasErrors = Object.keys(mergedErrors).length > 0;

  // ---------------------------
  // HANDLERS
  // ---------------------------
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
        if (val === "ninguno")
          return { ...f, dietas: ["ninguno"], dietaOtro: "" };

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

  // ---------------------------
  // SUBMIT
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitted(true); // NUEVO → ahora sí se pueden mostrar errores
    setServerFieldErrors({});
    setGeneralServerError("");

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

    // captcha vacío
    if (!captchaToken) {
      setCaptchaError("Por favor resolvé el verificado de seguridad.");
      return;
    }

    // errores locales → no enviar
    if (Object.keys(localErrors).length > 0) return;

    // enviar
    setLoading(true);

    const payload = {
      first_name: form.name.trim(),
      last_name: form.lastname.trim(),
      email: form.email.trim(),
      phone: `${PHONE_PREFIX}${form.phoneRest}`.trim(),
      company: form.empresa.trim(),
      role: form.puesto.trim(),
      diet: form.dietas.join(","),
      diet_other: form.dietas.includes("otro") ? form.dietaOtro.trim() : null,
      status: "pending",
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
        setServerFieldErrors(out.field_errors || {});
        setGeneralServerError(out.detail || "Error al enviar la inscripción.");
        setLoading(false);

        if (window.turnstile) window.turnstile.reset();

        return;
      }

      setLoading(false);
      onSuccess?.(out);

    } catch (err) {
      setGeneralServerError("Error inesperado. Intentá de nuevo.");
      if (window.turnstile) window.turnstile.reset();
      setLoading(false);
    }
  };

  // ---------------------------
  // ESTILOS
  // ---------------------------
  const inputClass = (invalid) =>
    [
      "mt-1 w-full rounded-md border px-3 py-2 min-w-0",
      "bg-white text-slate-900 placeholder:text-slate-400",
      "focus-visible:ring-2 focus-visible:ring-[#050057] focus-visible:border-[#050057]",
      invalid ? "border-rose-400" : "border-slate-300",
    ].join(" ");

  const pillClass = (active, invalid) =>
    [
      "block w-full h-10 min-w-0",
      "rounded-xl border text-sm text-center",
      "inline-flex items-center justify-center",
      "transition select-none",
      active
        ? "bg-[#050057] text-white border-[#050057] shadow-sm"
        : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50",
      invalid ? "ring-2 ring-rose-400 ring-offset-0" : "",
    ].join(" ");

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <form
      onSubmit={handleSubmit}
      className="relative rounded-xl bg-white text-slate-900 shadow-[0_10px_25px_rgba(0,0,0,0.12)] border border-slate-200 p-4 sm:p-6"
      noValidate
    >
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />

      {/* ---------- SOLO MOSTRAR ERRORES DESPUÉS DE ENVIAR ---------- */}
      {submitted && (hasErrors || generalServerError) && (
        <div className="mb-4 p-3 rounded-md bg-rose-100 border border-rose-300 text-rose-700 text-sm">
          <p className="font-semibold mb-1">
            No se pudo completar la inscripción:
          </p>

          {generalServerError && <p>{generalServerError}</p>}

          {Object.keys(mergedErrors).length > 0 && (
            <ul className="list-disc pl-4">
              {Object.entries(mergedErrors).map(([field, msg]) => (
                <li key={field}>
                  <strong>{field}:</strong> {msg}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* --- Título --- */}
      <h3 className="mb-1 text-slate-900 font-semibold leading-tight">
        Inscripción al evento
      </h3>
      <p className="mb-4 text-xs text-slate-500">
        Todos los campos son obligatorios
      </p>

      {/* --- FORM --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">

        {/* Nombre */}
        <div className="min-w-0">
          <label className="text-sm">Nombre*</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass(touched.name && !!mergedErrors.name)}
          />
          {touched.name && mergedErrors.name && (
            <p className="mt-1 text-xs text-rose-500">{mergedErrors.name}</p>
          )}
        </div>

        {/* Apellido */}
        <div className="min-w-0">
          <label className="text-sm">Apellido*</label>
          <input
            name="lastname"
            value={form.lastname}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass(touched.lastname && !!mergedErrors.lastname)}
          />
          {touched.lastname && mergedErrors.lastname && (
            <p className="mt-1 text-xs text-rose-500">{mergedErrors.lastname}</p>
          )}
        </div>

        {/* Email */}
        <div className="min-w-0">
          <label className="text-sm">Email*</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass(touched.email && !!mergedErrors.email)}
          />
          {touched.email && mergedErrors.email && (
            <p className="mt-1 text-xs text-rose-500">{mergedErrors.email}</p>
          )}
        </div>

        {/* Teléfono */}
        <div className="min-w-0">
          <label className="text-sm">Teléfono*</label>

          <div className="flex gap-2 max-[360px]:flex-col max-[360px]:gap-1 w-full">
            <input
              value={PHONE_PREFIX}
              readOnly
              className="mt-1 w-24 rounded-md border px-3 py-2 bg-slate-100 text-slate-500 border-slate-300"
            />
            <input
              name="phoneRest"
              value={form.phoneRest}
              onChange={handlePhoneChange}
              onBlur={handleBlur}
              placeholder="(351) 123-4567"
              className={inputClass(
                touched.phoneRest && !!mergedErrors.phoneRest
              )}
            />
          </div>

          {touched.phoneRest && mergedErrors.phoneRest && (
            <p className="mt-1 text-xs text-rose-500">
              {mergedErrors.phoneRest}
            </p>
          )}
        </div>

        {/* Empresa */}
        <div className="min-w-0">
          <label className="text-sm">Empresa*</label>
          <input
            name="empresa"
            value={form.empresa}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass(touched.empresa && !!mergedErrors.empresa)}
          />
          {touched.empresa && mergedErrors.empresa && (
            <p className="mt-1 text-xs text-rose-500">{mergedErrors.empresa}</p>
          )}
        </div>

        {/* Puesto */}
        <div className="min-w-0">
          <label className="text-sm">Puesto*</label>
          <input
            name="puesto"
            value={form.puesto}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass(touched.puesto && !!mergedErrors.puesto)}
          />
          {touched.puesto && mergedErrors.puesto && (
            <p className="mt-1 text-xs text-rose-500">{mergedErrors.puesto}</p>
          )}
        </div>

        {/* Dietas */}
        <div className="sm:col-span-2 min-w-0">
          <label className="text-sm">Preferencias de dieta*</label>

          <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DIET_OPTIONS.map((opt) => {
              const active = form.dietas.includes(opt.value);
              return (
                <label key={opt.value} className="cursor-pointer w-full">
                  <input
                    type="checkbox"
                    value={opt.value}
                    checked={active}
                    onChange={() => toggleDiet(opt.value)}
                    onBlur={() =>
                      setTouched((t) => ({ ...t, dietas: true }))
                    }
                    className="sr-only peer"
                  />
                  <span
                    className={pillClass(
                      active,
                      touched.dietas && !!mergedErrors.dietas
                    )}
                  >
                    {opt.label}
                  </span>
                </label>
              );
            })}
          </div>

          {touched.dietas && mergedErrors.dietas && (
            <p className="mt-1 text-xs text-rose-500">{mergedErrors.dietas}</p>
          )}

          {form.dietas.includes("otro") && (
            <div className="mt-2">
              <input
                name="dietaOtro"
                placeholder="Especificá tu dieta"
                value={form.dietaOtro}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClass(
                  touched.dietaOtro && !!mergedErrors.dietaOtro
                )}
              />
              {touched.dietaOtro && mergedErrors.dietaOtro && (
                <p className="mt-1 text-xs text-rose-500">
                  {mergedErrors.dietaOtro}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CAPTCHA */}
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
          className="
            flex-1 py-3 rounded-md bg-[var(--brand,#050057)] 
            text-white font-semibold hover:opacity-90 
            disabled:opacity-60 transition
          "
        >
          {loading ? "Enviando..." : "Enviar registro"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="
            py-3 px-4 rounded-md border border-slate-300 
            text-slate-700 hover:bg-slate-50 transition
          "
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
