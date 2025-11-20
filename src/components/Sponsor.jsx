import Image from "next/image";
import LenovoLogo from "../../public/lenovo.png";

const Sponsor = () => {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 text-center mb-6">
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
