// components/Agenda.jsx
"use client";

export default function Agenda() {
  const agenda = [
    {
      time: "17:45 – 18:15",
      title: "Recepción y acreditación",
      description:
        "Bienvenida a los participantes con café de recepción. Networking inicial entre decisores y asistentes técnicos.",
    },
    {
      time: "18:15 – 18:30",
      title: "Introducción",
      description:
        "Palabras de apertura de Wayclo e Intercity. Mensaje clave: las soluciones de conectividad y ciberseguridad están en Río Cuarto.",
    },
    {
      time: "18:30 – 20:00",
      title: "Panel de discusión: Desafíos reales y soluciones en IT en la región",
      description:
        "Participan Wayclo, Intercity y empresas invitadas. Casos de éxito, desafíos locales y debate sobre el futuro tecnológico de la región.",
    },
    {
      time: "20:00 – 20:15",
      title: "Break",
      description: "Coffee break y networking informal entre asistentes.",
    },
    {
      time: "20:15 – 20:45",
      title: "Charla especial: Ciberseguridad e Inteligencia Artificial",
      description:
        "Enfoque innovador sobre cómo la IA se integra como aliada en la seguridad y gestión IT empresarial.",
    },
    {
      time: "20:45 – 21:15",
      title: "Catering y networking final",
      description:
        "Cierre con cóctel distendido y conversaciones uno a uno entre líderes y decisores.",
    },
  ];

  return (
    <section className="py-20 bg-white text-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-10 text-center">
          AGENDA DEL EVENTO
        </h2>

        <div className="flex flex-col gap-8">
          {agenda.map((item) => (
            <div
              key={item.time}
              className="border-l-4 border-cyan-400 pl-6 hover:bg-gray-50 rounded-xl py-4 transition-all duration-300"
            >
              <h3 className="text-xl font-bold text-cyan-600 mb-1">
                {item.time} | {item.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
