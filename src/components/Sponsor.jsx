import Image from "next/image";
import LenovoLogo from "../../public/lenovo.png";
import ClusterLogo from "../../public/cluster-logo.png";
import VumgLogo from "../../public/vmug-logo.jpeg";

const Sponsor = () => {
  return (
    <div className="flex flex-col items-center justify-center mb-2 md:mb-10 mt-12 md:mt-24">
      <h2 className="md:text-xl text-lg font-bold tracking-tight text-cyan-950 pb-6">
        ACOMPAÑA
      </h2>

      {/* CONTENEDOR DE LOGOS */}
      <div className="flex items-center justify-center gap-6 sm:gap-10">
        <Image
          src={LenovoLogo}
          alt="Lenovo"
          width={200}
          height={200}
          className="w-24 sm:w-32 md:w-40 lg:w-48 h-auto"
        />

        <Image
          src={ClusterLogo}
          alt="Cluster Tecnológico"
          width={200}
          height={200}
          className="w-24 sm:w-32 md:w-40 lg:w-48 h-auto"
        />

        <Image
          src={VumgLogo}
          alt="VUMG"
          width={200}
          height={200}
          className="w-24 sm:w-32 md:w-40 lg:w-48 h-auto"
        />
      </div>
    </div>
  );
};

export default Sponsor;
