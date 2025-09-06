import { Genos } from "next/font/google";
const gen = Genos({ subsets: ['latin'], weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] });
import { ModelA2, seasons, crops, states, useFarm } from "../context/FarmContext";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

// ModelA2 fields to collect
type ModelA2Fields =
  | 'crop'
  | 'crop_year'
  | 'season'
  | 'state'
  | 'area'
  | 'production'
  | 'annual_rainfall'
  | 'fertilizer'
  | 'pesticide';

  const initialForm: ModelA2 = {
  crop: 'Arecanut',
  crop_year: new Date().getFullYear(),
  season: 'Kharif',
  state: '',
  area: 0,
  production: 0,
  annual_rainfall: 0,
  fertilizer: 0,
  pesticide: 0,
};


export default function YieldPrediction(){
    const { token } = useAuth();
    const { data: session } = useSession();
    const {modelA2setup, modelA2data, setModelA2Setup, setModelA2Data, setModelA2Output, modelA2output} = useFarm();
    const [formData, setFormData] = useState<ModelA2>(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const parsed = ['area', 'production', 'annual_rainfall', 'fertilizer', 'pesticide', 'crop_year'].includes(name)
        ? Number(value)
        : value;
        setFormData((prev) => ({
        ...prev,
        [name]: parsed,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (
        formData.crop.trim() === '' ||
        formData.state.trim() === '' ||
        formData.crop_year < 1900 ||
        formData.crop_year > 2100 ||
        formData.area < 0 ||
        formData.production < 0 ||
        formData.annual_rainfall < 0 ||
        formData.fertilizer < 0 ||
        formData.pesticide < 0
        ) {
        setError("Please enter valid input values.");
        return;
        }

        setError(null);
        setLoading(true);

        try {
        const reqToken = token || session?.accessToken;
        const response = await fetch("http://localhost:3001/api/farm/A2/inputs", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${reqToken}`,
            },
            body: JSON.stringify({ yield_prediction_input: formData }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to save data");
        }

        const result = await response.json();
        setModelA2Output(result.model_output.Prediction);
        setLoading(false);
        } catch (err: any) {
        setLoading(false);
        setError(err.message || "Something went wrong");
        }
    };

    
    return(
        <div
      className={`h-[77vh] w-full flex flex-col items-center justify-center relative z-5 rounded-xl text-white text-[2vh] ${gen.className}`}
    >
      <img
        src={`/bg_noise/darker_green.png`}
        alt=""
        className="absolute z-3 w-full h-full rounded-xl object-cover"
      />
      <div className="z-4 h-[10%] w-full flex items-end justify-center font-bold text-[4vh]">Yield Prediction</div>
      <div className="z-4 h-[5%] w-full flex items-center justify-center font-medium">Predict yield using crop, season, and environmental inputs.</div>
      <div className="z-4 h-[85%] w-full flex items-center justify-center">
        <div className="h-full w-2/3 flex flex-col items-center justify-center">
            <form onSubmit={handleSubmit} className="w-full h-full flex items-center justify-center gap-4 p-6 text-[2.27vh] font-medium">
            {/* Inputs */}
            <div className="h-full w-1/2 flex flex-col items-center justify-center gap-[2vh]">
                <div className="w-3/4">
                    <label>Crop Name</label>
                    <select
                    name="crop"
                    value={formData.crop}
                    onChange={handleChange}
                    className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white focus:outline-none focus:ring-2 focus:ring-white"
                    >
                    {crops.map((s) => (
                        <option key={s} value={s}>
                        {s}
                        </option>
                    ))}
                    </select>
                </div>
                <div className="w-3/4">
                    <label>Crop Year</label>
                    <input
                    name="crop_year"
                    type="number"
                    value={formData.crop_year}
                    onChange={handleChange}
                    className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white focus:outline-none focus:ring-2 focus:ring-white"
                    />
                </div>
                <div className="w-3/4">
                    <label>Season</label>
                    <select
                    name="season"
                    value={formData.season}
                    onChange={handleChange}
                    className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white focus:outline-none focus:ring-2 focus:ring-white"
                    >
                    {seasons.map((s) => (
                        <option key={s} value={s}>
                        {s}
                        </option>
                    ))}
                    </select>
                </div>
                <div className="w-3/4">
                    <label>State</label>
                    <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white focus:outline-none focus:ring-2 focus:ring-white"
                    >
                    {states.map((s) => (
                        <option key={s} value={s}>
                        {s}
                        </option>
                    ))}
                    </select>
                </div>
                <div className="w-3/4">
                    <label>Area (ha)</label>
                    <input
                    name="area"
                    type="number"
                    value={formData.area}
                    onChange={handleChange}
                    className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white focus:outline-none focus:ring-2 focus:ring-white"
                    />
                </div>
            </div>
            <div className="h-full w-1/2 flex flex-col items-center justify-center gap-[2vh]">
                <div className="w-3/4">
                    <label>Production (kg)</label>
                    <input
                    name="production"
                    type="number"
                    value={formData.production}
                    onChange={handleChange}
                    className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white focus:outline-none focus:ring-2 focus:ring-white"
                    />
                </div>
                <div className="w-3/4">
                    <label>Annual Rainfall (mm)</label>
                    <input
                    name="annual_rainfall"
                    type="number"
                    value={formData.annual_rainfall}
                    onChange={handleChange}
                    className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white focus:outline-none focus:ring-2 focus:ring-white"
                    />
                </div>
                <div className="w-3/4">
                    <label>Fertilizer Usage (kg)</label>
                    <input
                    name="fertilizer"
                    type="number"
                    value={formData.fertilizer}
                    onChange={handleChange}
                    className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white focus:outline-none focus:ring-2 focus:ring-white"
                    />
                </div>
                <div className="w-3/4">
                    <label>Pesticide Usage (kg)</label>
                    <input
                    name="pesticide"
                    type="number"
                    value={formData.pesticide}
                    onChange={handleChange}
                    className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white focus:outline-none focus:ring-2 focus:ring-white"
                    />
                </div>

                {/* Submit Button */}
                <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`mt-4 px-4 py-2 rounded-xl font-semibold text-darker-green ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{
                    backgroundImage: "url('/bg_noise/white.png')",
                    backgroundSize: "cover",
                    }}
                >
                    {loading ? "Submitting..." : "Predict Yield"}
                </motion.button>
            </div>

            {/* Error */}
            {error && (
                <motion.div className="mt-4 text-red-400 font-medium">
                {error}
                </motion.div>
            )}
            </form>
        </div>        

        {/* Output */}
        <div className="h-full w-1/3 flex flex-col items-center justify-center">
            <div className="h-[30%] w-full flex items-center justify-center text-[3vh] font-semibold z-4">History</div>
            <div className="h-[70%] w-full flex flex-col items-center justify-start text-[2.54vh] font-medium z-4">
                <div className="text-[2.54vh] font-semibold">Estimated Yield: (kg/ha)</div>
                {modelA2output && (
                    <div className="mt-4 p-4 bg-white text-darker-green font-bold text-[2.5vh] rounded-xl">{modelA2output}</div>
                )}
          </div>
        </div>
      </div>
    </div>
  );
}
