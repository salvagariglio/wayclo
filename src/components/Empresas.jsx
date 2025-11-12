"use client";

import Image from "next/image";
import WaycloLogo from "../../public/logo-wayclo.png";
import IntercityLogo from "../../public/intercity.png";
import LenovoLogo from "../../public/lenovo.png";

export default function Empresas() {
  return (
    <div className="my-10 flex items-center justify-center gap-10 sm:gap-12">
      <Image
        src={WaycloLogo}
        alt="Wayclo"
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
  );
}
