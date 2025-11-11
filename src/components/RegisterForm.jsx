"use client";

import { useMemo, useState } from "react";

export default function RegisterForm({ onSuccess, onClose }) {
  const PHONE_PREFIX = "+54 ";

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
  const DIET_BASE = [
    { value: "vegetariano", label: "Vegetariano" },
    { value: "vegano", label: "Vegano" },
    { value: "celiaco", label: "Celíaco" },
    { value: "diabetico", label: "Diabético" },
    { value: "ninguno", label: "Ninguno" },
    { value: "otro", label: "Otro" },
  ];
  const DIET_OPTIONS = useMemo(() => {
    const other = DIET_BASE.find((d) => d.value === "otro");
    const rest = DIET_BASE.filter((d) => d.value !== "otro");
    rest.sort((a, b) =>
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

  const handleSubmit = (e) => {
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
    if (hasErrors) return;

    setLoading(true);
    const payload = {
      ...form,
      phone: `${PHONE_PREFIX}${form.phoneRest}`.trim(),
    };
    setTimeout(() => {
      setLoading(false);
      onSuccess?.(payload);
    }, 900);
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

        {/* Teléfono con prefijo fijo */}
        <div>
          <label className="text-sm">Teléfono*</label>
          <div className="mt-1 flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-700 text-sm select-none">
              {PHONE_PREFIX}
            </span>
            <input
              name="phoneRest"
              required
              inputMode="numeric"
              pattern="^[0-9()\s-]{6,}$"
              value={form.phoneRest}
              onChange={handlePhoneChange}
              onBlur={handleBlur}
              className={[
                "flex-1 rounded-r-md border px-3 py-2",
                "bg-white text-slate-900 placeholder:text-slate-400",
                "focus-visible:ring-2 focus-visible:ring-[var(--brand,#050057)] focus-visible:border-[var(--brand,#050057)]",
                touched.phoneRest && !!errors.phoneRest
                  ? "border-rose-400"
                  : "border-slate-300",
              ].join(" ")}
              aria-invalid={touched.phoneRest && !!errors.phoneRest}
              aria-describedby="err-phone"
              placeholder="351 123 4567"
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
            aria-invalid={touched.empresa && !!errors.empresa}
            aria-describedby="err-empresa"
          />
          {touched.empresa && errors.empresa && (
            <p id="err-empresa" className="mt-1 text-xs text-rose-500">
              {errors.empresa}
            </p>
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
            aria-invalid={touched.puesto && !!errors.puesto}
            aria-describedby="err-puesto"
          />
          {touched.puesto && errors.puesto && (
            <p id="err-puesto" className="mt-1 text-xs text-rose-500">
              {errors.puesto}
            </p>
          )}
        </div>
      </div>

      {/* Dietas (multiselección con chips de tamaño uniforme) */}
      <div className="mt-4">
        <label className="text-sm block">Preferencias de dieta*</label>

        <div
          className={[
            "mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2",
            touched.dietas && errors.dietas ? "pb-1" : "",
          ].join(" ")}
          role="group"
          aria-label="Preferencias de dieta"
        >
          {DIET_OPTIONS.map((opt) => {
            const active = form.dietas.includes(opt.value);
            return (
              <label key={opt.value} className="cursor-pointer w-full">
                {/* Checkbox real (accesible) */}
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
