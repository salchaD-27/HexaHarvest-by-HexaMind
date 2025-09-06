'use client';
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useInView } from 'react-intersection-observer';
import { motion, useScroll, useTransform } from 'framer-motion';
import Header from "./components/Header";
import { Genos } from "next/font/google";
import Link from "next/link";
import { useAuth } from "./context/AuthContext";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from 'next/navigation';
import { useFarm } from "./context/FarmContext";

const gen = Genos({ subsets: ['latin'], weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] });

const team = [
  {name: "Shreyansh Trivedi", role: "Frontend Developer", desc: "HexaHarvest Frontend Development", dp: 'trivedi'},
  {name: "Harshwardhan Singh", role: "AIML ModelA Engineer", desc: "Crop Advisory & Yield Prediction Model Development", dp: 'harsh'},
  {name: "Amay Garg", role: "AIML ModelA Engineer", desc: "Crop Advisory & Yield Prediction Model Development", dp: 'amay'},
  {name: "Mooksh Jain", role: "AIML ModelB Engineer", desc: "Livestock Monitoring & Biosecurity Model Development", dp: 'mooksh'},
  {name: "Kriti Khanijo", role: "AIML ModelB Engineer", desc: "Livestock Monitoring & Biosecurity Model Development", dp: 'kriti'},
  {name: "Dharyansh Achlas", role: "(Team Lead) Backend Developer & DevOps Engineer", desc: "HexaHarvest Backend Development and DevOps Integration", dp: 'da'}
];
export default function Home() {
  const div1Ref = useRef<HTMLDivElement|null>(null);
  const [offsetY, setOffsetY] = useState(0);
  const {isLoggedIn} = useAuth();
  const {data: session} = useSession();
  const { farmInit } = useFarm();

  const {ref:div1Ref2, inView:div1Ref2InView} = useInView({
    triggerOnce: false, 
    threshold: 0.3, // trigger when 30% of the component is visible
  });
  
  // parallax scroll
  useEffect(() => {
    const handleScroll = () => {
      // Get how much user has scrolled vertically
      const scrollY = window.scrollY || window.pageYOffset;
      // Multiply scrollY by factor > 1 to make this div move faster (e.g. 1.5)
      setOffsetY(scrollY * 0.27);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  

  return (
    <>
      <Header div1Ref={div1Ref} homepage={true}/>

      {/* div1 */}
      <div ref={div1Ref} className={`relative h-[100vh] w-full flex flex-col items-center justify-center overflow-clip ${gen.className}`}>
        <img src={`/bg_noise/white.png`} alt="" className="absolute z-1 h-full w-full object-cover"/>
        {/* parallax bg */}
        <img src={`/landingpage_harvestborder/2.png`} alt="" className="absolute z-2 bottom-[-10vh] h-auto w-full object-contain"/>

        <div className="h-[20%] w-full flex items-center justify-center"></div>
        <motion.div className="h-[30%] w-full flex flex-col items-center justify-center p-[10vh] z-4 text-white text-[17vh] font-extrabold"
          style={{ transform: `translateY(-${offsetY}px)`, transition: 'transform 0.1s linear' }}
        >HexaHarvest</motion.div>
        <div className="h-[10%] w-full flex items-center justify-center"></div>
        <motion.div className="h-[20%] w-3/4 flex flex-col items-center justify-center py-[10vh] z-4 text-white text-[3vh] font-bold text-center"
          style={{ transform: `translateY(-${offsetY}px)`, transition: 'transform 0.1s linear' }}
        >
          <span className="">An AI-powered digital platform for small- and medium-scale farmers to manage crops and livestock, track antimicrobial use, ensure biosecurity, and boost productivity.</span>
          <span className="z-4 text-white text-[3vh] font-normal text-center">Get smart crop advisory, detect pest risks early, manage treatments, and stay compliant — all in one place</span>
        </motion.div>
        <div className="h-[10%] z-4 w-full flex items-center justify-center">
          <Link href={`${isLoggedIn||session?.user?'/dashboard':'/auth'}`} className="h-auto w-auto flex items-center justify-center">
            <motion.button whileHover={{ scale: 1.054 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-auto h-auto flex items-center justify-center py-2 px-4 rounded-xl text-darker-green font-semibold cursor-pointer text-[2.27vh] hover:opacity-[0.77]"
              style={{backgroundImage: "url('/bg_noise/white.png')", backgroundSize: 'cover'}}
            >Get Started</motion.button>
          </Link>
        </div>
        <div className="h-[10%] w-full flex items-center justify-center"></div>
      </div>
      
      
      {/* div2 - about */}
      <div id='about' className={`relative z-4 h-[63vh] w-full flex flex-col items-center justify-center px-[10vw] ${gen.className}`}>
        <img src={`/bg_noise/darkest_green.png`} alt="" className="absolute z-1 h-full w-full object-cover"/>
        <div className="h-[10%] w-full flex items-center justify-center text-white font-semibold text-[4vh] z-4">About</div>
        <div className="h-auto w-full flex items-center justify-center z-4 text-white text-[2.54vh] text-center my-[2vh] font-medium">Our platform is a unified, AI-driven digital solution built to transform the way small- and medium-scale farmers, veterinarians, and agricultural authorities manage farming and livestock operations. By bringing together the latest advancements in artificial intelligence, data analytics, and cloud technology, we help agricultural communities make informed, efficient, and sustainable decisions.</div>
        <div className="h-auto w-[2/3] flex flex-col items-center justify-center z-4 text-white text-[2.27vh] text-center">
          <span>Modern agriculture faces increasing challenges: fluctuating weather, unpredictable yields, rising antimicrobial resistance, and complex compliance demands. Farmers often lack access to personalized, real-time guidance that’s both affordable and actionable. Our mission is to change that.</span>
          <span>We created this platform to provide a centralized, intelligent system that offers:</span>
          <span>- Real-time crop and livestock advisory</span>
          <span>- Biosecurity risk assessments and compliance tracking</span>
          <span>- Responsible antimicrobial usage (AMU) monitoring</span>
          <span>- AI-powered yield prediction and input optimization</span>
          <span>- Transparent dashboards for stakeholders and authorities</span>
        </div>
        <div className="h-[5%] w-full flex items-center justify-center text-white font-semibold text-[4vh] z-4"></div>
      </div>


      {/* div3 - hxhv cert */}
      <div id='hxhv' className={`relative h-[81vh] w-full flex flex-col items-center justify-center ${gen.className}`}>
        {/* <img src={`/bg_noise/darker_green.png`} alt="" className="absolute z-1 h-full w-full object-cover"/> */}
        {/* <img src={`/landingpage_harvestborder/1.png`} alt="" className="absolute left-0 z-2 h-full w-full object-contain object-left"/> */}
        <img src={`/landingpage_harvestborder/1.png`} alt="" className="absolute z-1 h-full w-full object-cover object-bottom"/>
        <div className="h-[15%] z-2 w-full flex items-end justify-center text-white text-[4vh] font-bold">Get HexaHarvest Standardized</div>
        <div className="h-[85%] w-full flex items-center justify-center">
          <div className="h-full w-[30%] z-2 flex flex-col items-center justify-center relative text-white font-semibold text-[4vh]">
            <div className="h-auto w-[54%] flex items-center justify-center bg-black/20 rounded-xl">
              {/* <motion.img animate={{ rotateY: 360 }} transition={{ repeat: Infinity, duration: 5, ease: "linear" }} style={{ transformStyle: 'preserve-3d' }}
                src={`/logos/hexaharvest_logo.png`} alt="" className="z-2 h-auto w-full object-contain rounded-xl"/> */}
                <video
                src="/logos/hexaharvest_logo.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="z-2 h-auto w-full object-contain rounded-xl"
                ref={(video) => {if (video) video.playbackRate = 2.0;}}
              />
            </div>
            <span className="z-4">The HXHV Standard</span>
          </div>
          <div className="h-full w-[70%] flex flex-col items-start justify-center pr-[7vw] gap-[0.77vh] z-2 text-white text-[2.47vh]">
            <span className="font-semibold">HXHV Std. is a pioneering standard tailored specifically for agri-livestock operations. It represents a commitment to sustainable farming, responsible antimicrobial use, biosecurity, and data-driven crop and livestock management.</span>
            <span className="font-bold text-[3vh] mt-[4vh]">Why HXHV Std.?</span>
            <span className="font-medium"><strong>Standardized Quality Assurance:</strong>&nbsp;Farmers who adopt the HXHV Std. adhere to verified best practices powered by AI insights and compliance tracking</span>
            <span className="font-medium"><strong>Trust and Market Access:</strong>&nbsp;Certified farms gain recognition from authorities, buyers, and consumers looking for verified, safe, and sustainable produce</span>
            <span className="font-medium"><strong>AI-Powered Benefits:</strong>&nbsp;Certified members unlock exclusive access to enhanced AI-driven yield predictions, precision advisories, and risk management tools</span>
            <span className="font-medium"><strong>Regulatory Alignment:</strong>&nbsp;HXHV Std. aligns with national and international biosecurity and antimicrobial stewardship frameworks, easing audits and compliance processes</span>
          </div>
        </div>
      </div>

      {/* div4 */}
      <div className={`relative h-[70vh] w-full flex flex-col items-center justify-center px-[10vw] ${gen.className}`}>
        <img src={`/bg_noise/darkest_green.png`} alt="" className="absolute z-1 h-full w-full object-cover object-bottom"/>
        <div className="h-[10%] w-full flex items-center justify-center text-white font-semibold text-[4vh] z-4 mb-[2vh]">How Does The HXHV Std. Work?</div>
        <div className="h-auto w-[2/3] flex flex-col items-center justify-center z-4 text-white text-[2.27vh] text-center">
          <span className="font-normal"><strong>Opt-in Certification:</strong>&nbsp;Farmers voluntarily register for the HXHV certification through our platform</span>
          <span className="font-normal"><strong>Data-Driven Assessment:</strong>&nbsp;The platform continuously monitors farm practices — antimicrobial use, biosecurity compliance, crop and livestock health</span>
          <span className="font-normal"><strong>Periodic Audits & Reports:</strong>&nbsp;Using AI-generated analytics and automated reports, the farm’s adherence to HXHV standards is reviewed regularly</span>
          <span className="font-normal"><strong>Certification Award:</strong>&nbsp;Farms meeting the criteria receive the HXHV Cert badge, valid for a defined period, with renewal options</span>
          <span className="font-normal"><strong>Market Visibility:</strong>&nbsp;Certified farms are listed on a trusted directory accessible by regulators, vendors, and consumers</span>
        </div>
        <div className="h-[5%] w-full flex items-center justify-center text-white font-semibold text-[4vh] z-4"></div>
        <div className="h-[10%] w-full flex items-center justify-center text-white font-semibold text-[4vh] z-4 my-[2vh]">Strategic Impact</div>
        <div className="h-auto w-[2/3] flex flex-col items-start justify-center z-4 text-white text-[2.27vh] text-center">
          <span className="font-medium">The HXHV Std. positions our platform as an industry leader and standard-bearer in agri-livestock digital transformation, opening new partnerships with government agencies, agricultural bodies, and market stakeholders while empowering farmers to thrive sustainably and profitably</span>
        </div>
        <Link href={`${isLoggedIn||session?.user?'/dashboard':'/auth'}`} className="h-auto w-auto flex items-center justify-center mt-[5vh]">
            <motion.button whileHover={{ scale: 1.054 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="z-4 w-auto h-auto flex items-center justify-center py-2 px-4 rounded-xl text-darker-green font-semibold cursor-pointer text-[2vh] hover:opacity-[0.77]"
              style={{backgroundImage: "url('/bg_noise/white.png')", backgroundSize: 'cover'}}
            >Get HXHV Standardized</motion.button>
          </Link>
        <div className="h-[5%] w-full flex items-center justify-center text-white font-semibold text-[4vh] z-4"></div>
      </div>
      
      
      
      {/* div5 - team */}
      <div id='team' className={`relative h-[81vh] w-full flex flex-col items-center justify-center ${gen.className}`}>
        <img src={`/bg_noise/white.png`} alt="" className="absolute z-1 h-full w-full object-cover"/>
        {/* <img src={`/landingpage_harvestborder/1.png`} alt="" className="absolute z-1 h-auto w-full object-contain"/> */}
        <div className="h-[10%] w-full flex items-end justify-center text-darker-green font-semibold text-[4vh] z-4">Team - HexaMind</div>
        <div className="h-[80%] w-full flex items-center justify-center gap-[2vh] px-[2vh]">
          {team.map((t,i)=>{
            return(
              <div key={i} className="h-[90%] w-[17vw] flex flex-col items-center justify-start relative z-4 text-center rounded-xl p-[1vw]">
                <img src={`/bg_noise/${t.dp=='da'?'darkest_green':'darker_green'}.png`} alt="" className="absolute z-2 h-full w-full object-cover rounded-xl"/>
                <div className="z-4 h-[50%] w-full flex items-start justify-center text-white rounded-xl text-[4vh] font-bold my-[2vh] relative">
                  <img src={`/team_dps/${t.dp}.png`} alt="" className="absolute z-3 h-full w-auto object-cover rounded-xl"/>
                </div>
                <div className="z-4 h-[20%] w-full flex items-center justify-center text-white text-[2.27vh] font-bold mb-[2vh]">{t.name}</div>
                <div className="z-4 h-[30%] w-full flex flex-col items-center justify-start text-white ">
                  <span className="text-[2vh] font-semibold">{t.role}</span>
                  <span className="text-[1.77vh] font-medium">{t.desc}</span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="h-[10%] w-full flex items-center justify-center text-darker-green font-semibold text-[4vh] z-4"></div>
      </div>
    </>
  );
}
