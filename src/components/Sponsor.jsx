import Image from "next/image";
import LenovoLogo from "../../public/lenovo.png";

const Sponsor = () => {
    return (
        <div className="flex flex-col items-center justify-center mb-2 md:mb-10 mt-12 md:mt-24">
            <h2 className="md:text-xl text-lg text-start font-bold tracking-tight text-cyan-950 pb-6">
                ACOMPAÑA
            </h2>

            <Image
                src={LenovoLogo}
                alt="Lenovo"
                width={300}
                height={300}
                className="
          w-32
          sm:w-40
          md:w-52
          lg:w-64
          h-auto
        "
            />
        </div>
    );
};

export default Sponsor;
