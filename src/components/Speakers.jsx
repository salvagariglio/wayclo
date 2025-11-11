"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Linkedin, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
const speakers = [
  {
    name: "Cristian Mercado",
    role: "Director",
    company: "Wayclo",
    linkedin: "https://www.linkedin.com/in/cristian--mercado/",
    img: "/speakers/cristian.jpg",
    session: "Panel 1",
  },
  {
    name: "Martín Lovera",
    role: "Gerente de Auditorías",
    company: "Sala Hnos.",
    linkedin: "",
    img: "/speakers/martin-lovera.jpg",
    session: "Panel 1",
  },
  {
    name: "Pablo Degiglio",
    role: "Téc. Centro de Cómputos",
    company: "Municipalidad de Río Cuarto",
    linkedin: "",
    img: "/speakers/pablo-degiglio.jpg",
    session: "Panel 1",
  },
  {
    name: "Iván Pecovich",
    role: "Socio Gerente",
    company: "Intercity Comunicaciones S.A.",
    linkedin: "",
    img: "/speakers/ivan-pecovich.jpg",
    session: "Panel 1",
  },
  {
    name: "Eduardo Ochoa",
    role: "Director del centro de Cómputos de la Municipalidad de Río Cuarto",
    company: "Municipalidad de Río Cuarto",
    linkedin: "",
    img: "/speakers/eduardo.jpg",
    session: "Panel 1",
  },
  {
    name: "Hernán Gariglio",
    role: "CEO & Fundador",
    company: "Wayclo",
    linkedin: "https://www.linkedin.com/in/hernangariglio9/",
    img: "/speakers/hernan.jpg",
    session: "Panel 1",
  },
  {
    name: "Gustavo Matuk",
    role: "Cybersecurity Advisor",
    company: "Wayclo",
    linkedin: "https://www.linkedin.com/in/gustavo-matuk-66b96613/",
    img: "/speakers/gustavo.jpg",
    session: "Panel 2",
  },
  {
    name: "Emmanuel Vilas",
    role: "Cybercrime Researcher · Director de carrera",
    company: "Universidad Siglo 21",
    linkedin: "https://www.linkedin.com/in/emmanuelvilas/",
    img: "/speakers/emmanuel.jpg",
    session: "Panel 2",
  },
];

export default function SpeakersCarousel() {
  const [active, setActive] = useState(0);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <section className="bg-slate-950 text-white relative overflow-visible min-h-[80vh] flex flex-col items-center justify-center py-16 md:py-20">
      <div className="w-full relative overflow-visible flex flex-col items-center gap-6">
        <h2 className="text-3xl md:text-5xl font-extrabold text-center tracking-tight">
          SPEAKERS INVITADOS
        </h2>

        {/* Flechas (Ocultas en mobile, visibles en md+) */}
        <button
          ref={prevRef}
          aria-label="Anterior"
          className="hidden md:flex absolute left-3 lg:left-8 top-[calc(50%+10px)] -translate-y-1/2 z-30
                     items-center justify-center w-12 h-12 lg:w-14 lg:h-14
                     rounded-full bg-slate-900/70 border border-slate-700
                     text-slate-200 hover:text-cyan-400 hover:border-cyan-400
                     shadow-[0_0_18px_rgba(56,189,248,0.25)] backdrop-blur transition-all duration-200"
        >
          <ChevronLeft className="w-6 h-6 lg:w-7 lg:h-7" />
        </button>
        <button
          ref={nextRef}
          aria-label="Siguiente"
          className="hidden md:flex absolute right-3 lg:right-8 top-[calc(50%+10px)] -translate-y-1/2 z-30
                     items-center justify-center w-12 h-12 lg:w-14 lg:h-14
                     rounded-full bg-slate-900/70 border border-slate-700
                     text-slate-200 hover:text-cyan-400 hover:border-cyan-400
                     shadow-[0_0_18px_rgba(56,189,248,0.25)] backdrop-blur transition-all duration-200"
        >
          <ChevronRight className="w-6 h-6 lg:w-7 lg:h-7" />
        </button>

        {/* Carrusel */}
        <Swiper
          modules={[Navigation, Pagination, A11y, Autoplay]}
          onBeforeInit={(sw) => {
            sw.params.navigation.prevEl = prevRef.current;
            sw.params.navigation.nextEl = nextRef.current;
          }}
          onInit={(sw) => {
            sw.navigation.init();
            sw.navigation.update();
          }}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 3600,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop
          slidesPerGroup={1}
          centeredSlides
          speed={550}
          roundLengths
          watchSlidesProgress
          grabCursor
          resistanceRatio={0.85}
          spaceBetween={28}
          slidesPerView={1.3}
          breakpoints={{
            480: { slidesPerView: 1.3, spaceBetween: 28, centeredSlides: true },
            640: { slidesPerView: 1.4, spaceBetween: 32, centeredSlides: true },
            768: { slidesPerView: 1.5, spaceBetween: 40, centeredSlides: true },
            1024: { slidesPerView: 3, spaceBetween: 64, centeredSlides: true },
            1440: { slidesPerView: 3, spaceBetween: 72, centeredSlides: true },
          }}
          onSlideChange={(sw) => setActive(sw.realIndex)}
          onSwiper={(sw) => setActive(sw.realIndex)}
          className="overflow-visible !pb-10 md:!pb-12 w-full max-w-[1700px]"
        >
          {speakers.map((sp, i) => (
            <SwiperSlide
              key={sp.name}
              className="flex items-center justify-center py-8 md:py-10 lg:py-12 overflow-visible"
            >
              <SpeakerCard data={sp} featured={i === active} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

function SpeakerCard({ data, featured = false }) {
  const { name, role, company, linkedin, img, session } = data; // ⬅️ sumo session

  return (
    <div
      className={[
        "relative group h-full w-full",
        "max-w-[380px] sm:max-w-[400px] md:max-w-[420px] lg:max-w-[460px] xl:max-w-[480px]",
        "rounded-3xl border bg-slate-900/60 backdrop-blur-sm border-slate-800",
        "transition-all duration-500 ease-out will-change-transform flex flex-col items-center text-center",
        "px-6 py-8 md:px-8 md:py-10 lg:px-10 lg:py-12 overflow-hidden isolate",
        "min-h-[420px] md:min-h-[460px] lg:min-h-[480px]",
        featured
          ? "scale-105 md:scale-110 opacity-100 shadow-[0_0_40px_rgba(56,189,248,0.30)] border-cyan-400 z-[2]"
          : "scale-100 md:scale-[0.97] opacity-90 shadow-none md:brightness-[0.94] z-[1]",
      ].join(" ")}
    >
      {/* Luz superior controlada */}
      {featured && (
        <div
          className="absolute -top-14 left-1/2 -translate-x-1/2 w-[320px] h-[180px]
                     md:w-[480px] md:h-[240px] lg:w-[560px] lg:h-[280px]
                     bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.60)_0%,rgba(56,189,248,0.30)_40%,transparent_70%)]
                     blur-2xl opacity-80 pointer-events-none
                     [mask-image:linear-gradient(to_bottom,white_55%,transparent_100%)]"
        />
      )}

      {/* Capas internas con mismo radio */}
      <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none">
        <div
          className={[
            "absolute inset-0 rounded-[inherit]",
            "bg-[radial-gradient(120%_70%_at_50%_-10%,rgba(255,255,255,0.38)_0%,rgba(56,189,248,0.22)_30%,transparent_60%)]",
            featured ? "opacity-90" : "opacity-30",
            "transition-opacity duration-300",
          ].join(" ")}
        />
        <div
          className={[
            "absolute inset-0 rounded-[inherit]",
            featured
              ? "shadow-[inset_0_-80px_120px_-80px_rgba(56,189,248,0.22)]"
              : "shadow-[inset_0_-80px_120px_-90px_rgba(15,23,42,0.52)]",
          ].join(" ")}
        />
      </div>

      {/* ⬇️ Marcador chiquito (Panel 1 / Panel 2 / Charla). No altera tu diseño */}
      {session && (
        <span
          className="absolute top-3 right-3 text-[10px] font-semibold tracking-wide uppercase
                     bg-cyan-500/10 border border-cyan-400/30 text-cyan-300
                     px-2 py-0.5 rounded-full pointer-events-none"
        >
          {session}
        </span>
      )}

      {/* Foto */}
      <div className="relative w-32 h-32 md:w-44 md:h-44 lg:w-52 lg:h-52 mb-8 md:mb-10 rounded-full overflow-hidden border border-slate-700 shadow-md">
        <Image
          src={img}
          alt={name}
          fill
          className="object-cover"
          sizes="(min-width:1024px) 208px, (min-width:768px) 176px, 128px"
        />
      </div>

      {/* Texto */}
      <h3 className="text-lg md:text-xl font-bold text-cyan-400">{name}</h3>
      <p className="text-sm md:text-base text-slate-300">{role}</p>
      <p className="text-sm md:text-base text-slate-400 mb-5">{company}</p>

      {/* ⬇️ LinkedIn SOLO si existe */}
      {linkedin && (
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mt-auto"
        >
          <Linkedin className="w-6 h-6" /> LinkedIn
        </a>
      )}
    </div>
  );
}
