import CompaniesSection from "@/components/CompaniesSection";
import Sponsor from "@/components/Sponsor";

const waycloTexto = `
Soluciones integrales y ciberseguridad para el crecimiento empresarial
En Wayclo acompañamos a las organizaciones en su evolución digital mediante soluciones tecnológicas integrales que combinan infraestructura, nube y ciberseguridad, impulsando operaciones más eficientes, seguras y confiables.
Evaluamos cada entorno de forma personalizada para diseñar estrategias escalables y seguras, orientadas a la mejora continua, la reducción de riesgos y una transformación tecnológica alineada con los objetivos del negocio.
Somos partners de las marcas más reconocidas a nivel mundial en infraestructura, virtualización, respaldo, networking y seguridad, lo que nos permite ofrecer soluciones robustas y de alto rendimiento adaptadas a cada necesidad.
En Wayclo, la tecnología es el medio para un fin: impulsar el éxito empresarial, ayudando a las empresas a alcanzar nuevos niveles de rendimiento, resiliencia y protección.
`;

const intercityTexto = `
Intercity Comunicaciones S.A.: somos una empresa ISP (Internet Service Provider) con sede en Río Cuarto, Córdoba. Desde hace más de dos décadas brindamos soluciones de conectividad de alta calidad a hogares, empresas e instituciones. Esta trayectoria nos permitió consolidarnos como un referente regional en innovación tecnológica, cercanía y atención personalizada a nuestros clientes.
Ofrecemos servicios de internet por fibra óptica y Wireless, soluciones de conectividad para empresas (Land to Land, IP fijo), televisión digital y servicios integrales de telecomunicaciones adaptados a las necesidades del mercado corporativo y residencial.
`;

export default function EmpresasPage() {
  const companies = [
    {
      id: "wayclo",
      name: "Wayclo",
      logoSrc: "/logo-wayclo.png",
      about: waycloTexto,
      keyServices: [
        {
          icon: "ShieldCheck",
          title: "Ciberseguridad y Protección",
          description:
            "Soluciones integrales contra amenazas y reducción de riesgos.",
        },
        {
          icon: "Server",
          title: "Infraestructura & Nube",
          description:
            "Datacenters, virtualización y soluciones cloud escalables.",
        },
        {
          icon: "Database",
          title: "Respaldo y Resiliencia",
          description:
            "Estrategias de networking y respaldo para la continuidad del negocio.",
        },
      ],
      links: [
        {
          href: "https://wayclo.com",
          iconName: "Globe",
          label: "Sitio web",
        },
        {
          href: "https://www.linkedin.com/company/wayclo", // si cambia, lo ajustás
          iconName: "Linkedin",
          label: "LinkedIn",
        },
        {
          href: "https://www.instagram.com/waycloar?igsh=dmp2N2RxMzdva2py",
          iconName: "Instagram",
          label: "Instagram",
        },
      ],
      ctaHref: "https://wayclo.tech/#contacto",
      ctaLabel: "Hablar con Wayclo",
    },
    {
      id: "intercity",
      name: "Intercity",
      logoSrc: "/intercity.png",
      about: intercityTexto,
      keyServices: [
        {
          icon: "Zap",
          title: "Conectividad Fibra Óptica (FTTH)",
          description: "Planes de alta velocidad para hogares y empresas.",
        },
        {
          icon: "Building",
          title: "Soluciones Empresariales",
          description: "Conectividad dedicada para empresas e instituciones.",
        },
        {
          icon: "Tv",
          title: "TV Digital (Oy!)",
          description: "Servicio de televisión digital con contenido variado.",
        },
      ],
      links: [
        {
          label: "Sitio web",
          href: "https://www.intercity.net.ar/",
          iconName: "Globe",
        },
        {
          label: "LinkedIn",
          href: "https://www.linkedin.com/company/intercityinternet/",
          iconName: "Linkedin",
        },
        {
          label: "Instagram",
          href: "https://www.instagram.com/intercity.ar/",
          iconName: "Instagram",
        },
      ],
      ctaHref: "https://www.intercity.net.ar/#contact",
      ctaLabel: "Hablar con Intercity",
    },
  ];

  return (
    <main className="px-2">
      <CompaniesSection data={companies} />
      <div >
        <Sponsor />
      </div>
    </main >
  );
}
