import { Genos } from "next/font/google";
const gen = Genos({ subsets: ['latin'], weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] });

export default function AMU(){
    return(
        <div className={`h-[77vh] w-full flex items-center justify-center z-5 text-white text-[2vh] ${gen.className}`}>
            Coming Soon...
        </div>
    );
}