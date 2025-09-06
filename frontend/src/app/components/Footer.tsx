'use client';
import Image from "next/image";
import { Genos } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
const gen = Genos({ subsets: ['latin'], weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] });

export default function Footer(){
    const router = useRouter();
    const pathname = usePathname();
    
    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {el.scrollIntoView({ behavior: 'smooth' });}
      };
    const handleNavClick = (sectionId: string) => {
    if (pathname === '/') {
        scrollToSection(sectionId);  // Already on homepage, just scroll
    } else {
        router.push(`/#${sectionId}`);// Navigate to home, then scroll
    }
    };
    return(
        <div className={`z-2 relative h-[50vh] w-screen flex items-center justify-center text-white text-[2.27vh] font-medium ${gen.className}`}>
            <img src={`/landingpage_harvestborder/2.png`} alt="" className="z-3 absolute h-full w-full object-cover object-bottom"/>

            <div className="z-4 h-full w-1/3 flex flex-col items-center justify-center gap-[2vh]">
                <video
                    src="/logos/hexaharvest_logo.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="z-2 h-[17vh] w-auto object-contain rounded-xl"
                />
                <span className="z-4 text-[3vh] font-bold">The HXHV Standard</span>
            </div>
            <div className="h-full w-2/3 flex flex-col items-center justify-center pr-[7vw]">
                <div className="z-4 h-[70%] w-full flex flex-col items-start justify-center gap-[0.77vh] text-white text-[1.54vh]">
                    <span className="font-semibold">HXHV Std. is a pioneering standard tailored specifically for agri-livestock operations. It represents a commitment to sustainable farming, responsible antimicrobial use, biosecurity, and data-driven crop and livestock management.</span>
                    <span className="font-bold text-[3vh] mt-[4vh]">Why HXHV Std.?</span>
                    <span className="font-medium"><strong>Standardized Quality Assurance:</strong>&nbsp;Farmers who adopt the HXHV Std. adhere to verified best practices powered by AI insights and compliance tracking</span>
                    <span className="font-medium"><strong>Trust and Market Access:</strong>&nbsp;Certified farms gain recognition from authorities, buyers, and consumers looking for verified, safe, and sustainable produce</span>
                    <span className="font-medium"><strong>AI-Powered Benefits:</strong>&nbsp;Certified members unlock exclusive access to enhanced AI-driven yield predictions, precision advisories, and risk management tools</span>
                    <span className="font-medium"><strong>Regulatory Alignment:</strong>&nbsp;HXHV Std. aligns with national and international biosecurity and antimicrobial stewardship frameworks, easing audits and compliance processes</span>
                </div>
                <div className="z-4 h-[30%] w-full flex items-start justify-center border-t-1 border-white gap-[2vw] pt-[2vh]">
                    <span className="z-[104] hover:font-bold cursor-pointer" onClick={() => handleNavClick('about')}>About</span>
                    <span className="z-[104] hover:font-bold cursor-pointer" onClick={() => handleNavClick('team')}>Team</span>
                    <span className="z-[104] hover:font-bold cursor-pointer" onClick={() => handleNavClick('hxhv')}>HXHV Std.</span>
                    <span className="z-[104] hover:font-bold cursor-pointer" onClick={() => router.push('/auth')}>Crop Advisory</span>
                    <span className="z-[104] hover:font-bold cursor-pointer" onClick={() => router.push('/auth')}>Yield Prediction</span>
                    <span className="z-[104] hover:font-bold cursor-pointer" onClick={() => router.push('/auth')}>Biosecurity and Disease Risk</span>
                </div>
            </div>

            <div className="z-4 absolute h-[1vh] w-full bottom-[2vh]"><img src={`/bg_noise/black.png`} alt="" className="z-4 absolute h-full w-full object-cover"/></div>
            <div className="z-4 absolute h-[2vh] w-full bottom-0"><img src={`/bg_noise/darkest_green.png`} alt="" className="z-4 absolute h-full w-full object-cover"/></div>
        </div>
    );
}