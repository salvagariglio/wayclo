// components/Agenda.jsx
"use client";

export default function Agenda() {
  const agenda = [
    {
      time: "18:00 – 18:30",
      title: "Acreditación y bienvenida",
      description: "Recepción de asistentes y apertura.",
    },
    {
      time: "18:30 – 19:15",
      title: "Panel: Ciberseguridad hoy en las pymes",
      description: "Desafíos actuales y aprendizajes locales.",
      tag: "Panel",
    },
    {
      time: "19:15 – 19:30",
      title: "Break",
      description: "Café & networking rápido.",
    },
    {
      time: "19:30 – 20:15",
      title: "Charla: IA y seguridad en la empresa",
      description: "Riesgos, buenas prácticas y herramientas.",
      tag: "Charla",
    },
    {
      time: "20:15 – 21:00",
      title: "Networking & demos",
      description: "Conexiones entre empresas y partners.",
    },
  ];

  return (
    <section className="py-20 bg-white text-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-10 text-center">
          AGENDA DEL EVENTO
        </h2>

        <div className="flex flex-col gap-8">
          {agenda.map((it, idx) => (
            <div
              key={idx}
              className="border-l-4 border-cyan-400 pl-6 hover:bg-gray-50 rounded-xl py-4 transition-all duration-300"
            >
              <h3 className="text-xl font-bold text-cyan-600 mb-1">
                {it.time} | {it.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">{it.description}</p>
              {it.tag && (
                <span className="text-xs rounded-full bg-black text-white px-2 py-0.5">
                  {it.tag}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
