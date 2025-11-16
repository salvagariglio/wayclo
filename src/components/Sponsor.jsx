import Image from "next/image";
import LenovoLogo from "../../public/lenovo.png";

const Sponsor = () => {
    return (
        <div className="flex justify-center">
            <Image
                src={LenovoLogo}
                alt="Lenovo"
                width={300}
                height={300}
                className="
          w-32        /* mobile: más chico */
          sm:w-40     /* ≥640px */
          md:w-52     /* ≥768px */
          lg:w-64     /* ≥1024px */
          h-auto      /* mantiene proporción */
        "
            />
        </div>
    );
};

export default Sponsor;
