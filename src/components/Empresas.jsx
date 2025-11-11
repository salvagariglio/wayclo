"use client";

import Image from "next/image";
import WaycloLogo from "../../public/logo-wayclo.png";
import IntercityLogo from "../../public/intercity.png";
import LenovoLogo from "../../public/lenovo.png";

export default function Empresas() {
  return (
    <div
      className="
        w-full flex flex-col items-center justify-center
        gap-8 sm:gap-10
        sm:mt-32
        mb-24 
      "
    >
      {/* Logo principal (Wayclo) */}
      <div className="flex justify-center">
        <Image
          src={WaycloLogo}
          alt="Wayclo"
          className="h-20 sm:h-28 md:h-32 w-auto opacity-95"
          priority
        />
      </div>

      {/* Logos secundarios (Lenovo + Intercity) */}
      <div className="flex items-center justify-center gap-10 sm:gap-12">
        <Image
          src={LenovoLogo}
          alt="Lenovo"
          className="h-12 sm:h-16 md:h-20 w-auto opacity-95"
          priority
        />

        <Image
          src={IntercityLogo}
          alt="Intercity"
          className="h-12 sm:h-16 md:h-20 w-auto opacity-95"
          priority
        />
      </div>
    </div>
  );
}
