"use client";

import { useMemo, useState } from "react";

export default function RegisterForm({ onSuccess, onClose }) {
  const [form, setForm] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    empresa: "",
    puesto: "",
    comentarios: "",
  });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  // Validaciones (HTML5 + extra)
  const errors = useMemo(() => {
    const e = {};

    // Nombre / Apellido: 2+ letras
    if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ' -]{2,}$/.test(form.name || "")) e.name = "Ingresá un nombre válido (2+ letras).";
    if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ' -]{2,}$/.test(form.lastname || "")) e.lastname = "Ingresá un apellido válido (2+ letras).";

    // Email básico
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || "")) e.email = "Ingresá un email válido.";

    // Teléfono (7-20 dígitos aprox, permite +, espacios, guiones y paréntesis)
    if (!/^[+()0-9\s-]{7,20}$/.test(form.phone || "")) e.phone = "Ingresá un teléfono válido.";

    // Empresa / Puesto: requeridos
    if (!form.empresa?.trim()) e.empresa = "Este campo es obligatorio.";
    if (!form.puesto?.trim()) e.puesto = "Este campo es obligatorio.";

    // Comentarios: opcional, máx 500
    if ((form.comentarios || "").length > 500) e.comentarios = "Máximo 500 caracteres.";

    return e;
  }, [form]);

  const hasErrors = Object.keys(errors).length > 0;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Marcar todos como tocados para mostrar errores si hay
    setTouched({
      name: true, lastname: true, email: true, phone: true, empresa: true, puesto: true, comentarios: true,
    });

    if (hasErrors) return;

    setLoading(true);
    // TODO: aquí enviar a backend o sheets
    setTimeout(() => {
      setLoading(false);
      onSuccess?.();
    }, 900);
  };

  // Helper de clase input
  const inputClass = (invalid) =>
    [
      "mt-1 w-full rounded-md border px-3 py-2",
      "bg-white text-slate-900 placeholder:text-slate-400",
      "focus-visible:ring-2 focus-visible:ring-[var(--brand,#050057)] focus-visible:border-[var(--brand,#050057)]",
      invalid ? "border-rose-400" : "border-slate-300",
    ].join(" ");

  return (
    <form
      onSubmit={handleSubmit}
      className="
        relative rounded-xl
        bg-white text-slate-900
        shadow-[0_10px_25px_rgba(0,0,0,0.12)]
        border border-slate-200
        p-4 sm:p-6
      "
      style={{ ["--brand"]: "#050057" }}
      noValidate
    >
      {/* Título */}
      <h3 className="mb-1 text-slate-900 font-semibold leading-tight">
        Inscripción al evento
      </h3>
      <p className="mb-4 text-xs text-slate-500">
        Todos los campos son obligatorios
      </p>

      {/* Campos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nombre */}
        <div>
          <label className="text-sm">Nombre</label>
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
            <p id="err-name" className="mt-1 text-xs text-rose-500">{errors.name}</p>
          )}
        </div>

        {/* Apellido */}
        <div>
          <label className="text-sm">Apellido</label>
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
            <p id="err-lastname" className="mt-1 text-xs text-rose-500">{errors.lastname}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="text-sm">Email</label>
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
            <p id="err-email" className="mt-1 text-xs text-rose-500">{errors.email}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="text-sm">Teléfono</label>
          <input
            name="phone"
            required
            pattern="^[+()0-9\s-]{7,20}$"
            value={form.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass(touched.phone && !!errors.phone)}
            aria-invalid={touched.phone && !!errors.phone}
            aria-describedby="err-phone"
            placeholder="+54 9 351 123 4567"
          />
          {touched.phone && errors.phone && (
            <p id="err-phone" className="mt-1 text-xs text-rose-500">{errors.phone}</p>
          )}
        </div>

        {/* Empresa */}
        <div>
          <label className="text-sm">Empresa</label>
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
            <p id="err-empresa" className="mt-1 text-xs text-rose-500">{errors.empresa}</p>
          )}
        </div>

        {/* Puesto */}
        <div>
          <label className="text-sm">Puesto</label>
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
            <p id="err-puesto" className="mt-1 text-xs text-rose-500">{errors.puesto}</p>
          )}
        </div>
      </div>

      {/* Comentarios */}
      <div className="mt-4">
        <label className="text-sm">Comentarios (opcional)</label>
        <textarea
          name="comentarios"
          maxLength={500}
          value={form.comentarios}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputClass(touched.comentarios && !!errors.comentarios)}
          aria-invalid={touched.comentarios && !!errors.comentarios}
          aria-describedby="err-comentarios"
          placeholder="Máximo 500 caracteres"
          rows={4}
        />
        {touched.comentarios && errors.comentarios && (
          <p id="err-comentarios" className="mt-1 text-xs text-rose-500">{errors.comentarios}</p>
        )}
      </div>

      {/* Botones */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={loading}
          className="
            flex-1 py-3 rounded-md
            bg-[var(--brand,#050057)] text-white
            font-semibold
            hover:opacity-90
            disabled:opacity-60
            transition
          "
        >
          {loading ? "Enviando..." : "Enviar registro"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="
            py-3 px-4 rounded-md
            border border-slate-300
            text-slate-700
            hover:bg-slate-50
            transition
          "
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
