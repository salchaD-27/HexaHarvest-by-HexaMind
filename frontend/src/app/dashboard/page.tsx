'use client'
import Image from "next/image";
import { act, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Loading from "../components/Loading";
import Alert from "../components/Alert";
import Header from "../components/Header";

import { Genos } from "next/font/google";
import { useFarm } from "../context/FarmContext";
import FarmOverview from "../components/FarmOverview";
import CropAdvisory from "../components/CropAdvisory";
import YieldPrediction from "../components/YieldPrediction";
import Biosecurity from "../components/Biosecurity";
import AMU from "../components/AMU";
import FarmIntro from "../components/FarmIntro";
const gen = Genos({ subsets: ['latin'], weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] });


const tabs = [
  {name: 'Farm Overview', elem: <FarmOverview/>},
  {name: 'Crop Advisory', elem: <CropAdvisory/>},
  {name: 'Yield Prediction', elem: <YieldPrediction/>},
  {name: 'Biosecurity & Disease Risk', elem: <Biosecurity/>},
  {name: 'AMU (Antimicrobial Use)', elem: <AMU/>},
  {name: 'Pest & Disease Identification', elem: <AMU/>},
]

export default function Dashboard() {
  const router = useRouter();
  const { farmInit } = useFarm();
  const { data: session, status } = useSession(); // Google Auth session
  const [justLoggedOut, setJustLoggedOut] = useState(false);
  const div1Ref = useRef<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState('');
  const tabRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [sliderStyle, setSliderStyle] = useState({left: 0, width: 0,});
  const containerRef = useRef<HTMLDivElement>(null);

  const {ref:div1Ref2, inView:div1Ref2InView} = useInView({
    triggerOnce: false, 
    threshold: 0.3, // trigger when 30% of the component is visible
  });
  const [offsetY, setOffsetY] = useState(0);
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

  useEffect(() => {
    const updateSlider = () => {
      const el = tabRefs.current[activeTab];
      const container = containerRef.current;

      if (el && container) {
        const elRect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        setSliderStyle({
          left: elRect.left - containerRect.left,
          width: elRect.width,
        });
      }
    };

    updateSlider();

    // Also update slider on window resize for responsiveness
    window.addEventListener('resize', updateSlider);

    return () => window.removeEventListener('resize', updateSlider);
  }, [activeTab]);


  
  const { user, token, isLoggedIn, loading: authLoading, logout } = useAuth();
  const loading = authLoading || status === "loading";
  const isUserLoggedIn = isLoggedIn || status === "authenticated";

  if (loading) {return <Loading />;}
  if (!isUserLoggedIn) {
    return(
      <div className="z-2 relative h-[100vh] w-screen flex flex-col items-center justify-center">
        <Image className="z-1 object-cover object-center" src={`/landingpage_harvestborder/2.png`} alt="" fill/>
        <div className={`${gen.className} relative h-[77%] w-[77%] rounded-xl flex items-center justify-center`}>
          <img src={`/bg_noise/white.png`} alt="" className="absolute z-2 w-full h-full rounded-xl object-cover opacity-[0.81]"/>
          <Alert message={`${justLoggedOut?'LoggedOut Succesfully. Redirecting...':'User Not Found. Login to Continue. Redirecting...'}`} ok={false}/>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* header */}
      <Header div1Ref={div1Ref} homepage={false}/>

      {/* div1 */}
      <div ref={div1Ref} className={`z-2 relative h-[77vh] w-screen flex flex-col items-center justify-center ${gen.className}`}>
        <img src={`/landingpage_harvestborder/3.png`} alt="" className="absolute z-2 w-full h-full object-cover object-bottom"/>
        <div className="h-[20%] w-full"></div>
        <div className="h-[80%] z-3 w-full flex flex-col items-center justify-end text-white font-medium text-[3vh] px-[5vw] pb-[10vh] text-center">
          <video
            src="/logos/hexaharvest_logo.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="z-2 h-[22vh] w-auto object-contain rounded-xl"
            style={{ transform: `translateY(-${offsetY}px)`, transition: 'transform 0.1s linear' }}
            ref={(video) => {if (video) video.playbackRate = 2.0;}}
          />
          <motion.div className="text-[8vh] font-bold"
          style={{ transform: `translateY(-${offsetY}px)`, transition: 'transform 0.1s linear' }}>The HexaHarvest Standardized Farm</motion.div>
          <motion.div style={{ transform: `translateY(-${offsetY}px)`, transition: 'transform 0.1s linear' }}>Track your farm's health, compliance, and biosecurity practices all in one place. View your latest risk and compliance scores, monitor antibiotic use, and get actionable insights to improve farm management and reduce AMR risks.</motion.div>
        </div>
      </div>
      

      <div className={`z-2 relative h-auto w-screen flex flex-col items-center justify-center px-[4vw] gap-[2vh] ${gen.className}`}>
        <img src={`/bg_noise/darkest_green.png`} alt="" className="absolute z-0 w-full h-full object-cover" />
        <div className="h-[4vh] w-full z-2 flex items-start justify-center" />
        <div className="relative h-[7vh] w-full flex items-center justify-start rounded-xl">
          <img src={`/bg_noise/darker_green.png`} alt="" className="absolute z-3 w-full h-full rounded-xl object-cover" />
          <div ref={containerRef} className="relative flex gap-[2vw] items-center justify-start z-10 w-full px-[1vw]">
            {/* Sliding Background */}
            <motion.div
              className={`absolute rounded-xl h-[5vh] z-0 ${(activeTab=='AMU (Antimicrobial Use)'||activeTab=='Pest & Disease Identification')?'bg-white/50':'bg-white'}`}
              style={{ top: '50%', transform: 'translateY(-50%)' }}
              animate={{ left: sliderStyle.left, width: sliderStyle.width }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            {/* Tab Buttons */}
            {tabs.map((tab, i) => (
              <div
                key={i}
                ref={(el) => { tabRefs.current[tab.name] = el }}
                onClick={() => setActiveTab(tab.name)}
                className={`relative h-auto w-auto flex items-center justify-center ${(tab.name=='AMU (Antimicrobial Use)'||tab.name=='Pest & Disease Identification')?'cursor-wait':'cursor-pointer'} px-4 py-2 rounded-xl font-semibold text-[2.2vh] transition-colors duration-300 ${
                  activeTab === tab.name ? ((tab.name=='AMU (Antimicrobial Use)'||tab.name=='Pest & Disease Identification')?'text-darker-green/50':'text-darker-green') : ((tab.name=='AMU (Antimicrobial Use)'||tab.name=='Pest & Disease Identification')?'text-white/50':'text-white')
                }`}
              >
                {tab.name}
              </div>
            ))}
          </div>
        </div>

        <div className="h-auto w-full z-2 flex items-start justify-center">
          {tabs.find(tab => tab.name === activeTab)?.elem}
        </div>
        <div className="h-[4vh] w-full z-2 flex items-start justify-center" />
      </div>


    </>
  );
}