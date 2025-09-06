'use client';
import { Genos } from "next/font/google";
import { useFarm } from "../context/FarmContext";
const gen = Genos({ subsets: ['latin'], weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] });
import { ModelA1 } from "../context/FarmContext";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSession } from "next-auth/react";
import {motion} from 'framer-motion';


type ModelA1Fields = 'n' | 'p' | 'k' | 'temp';
const form1: { field: ModelA1Fields; name: string }[] = [
    {field: 'n', name:'N-Nitrogen (in kg/ha)'},
    {field: 'p', name:'P-Phosphorous (in kg/ha)'},
    {field: 'k', name:'K-Potassium (in kg/ha)'},
    {field: 'temp', name:'Temperature (in °C)'},
]
type ModelA2Fields = 'humidity' | 'ph' | 'rainfall';
const form2: { field: ModelA2Fields; name: string }[] = [
    {field: 'humidity', name:'Humidity (in %)'},
    {field: 'ph', name:'pH'},
    {field: 'rainfall', name:'Rainfall (in mm)'},
]
export default function CropAdvisory(){
    const {token} = useAuth();
    const {data:session} = useSession();
    const {modelA1setup, modelA1data, setModelA1Setup, setModelA1Data, setModelA1Output, modelA1output} = useFarm();
    const [formData, setFormData] = useState<ModelA1>({
        n: 0,
        p: 0,
        k: 0,
        temp: 0,
        humidity: 0,
        ph: 7,
        rainfall: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const valNum = Number(value);
        setFormData(prev => ({
        ...prev,
        [name]: isNaN(valNum) ? 0 : valNum,
        }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (
            formData.n < 0 ||
            formData.p < 0 ||
            formData.k < 0 ||
            formData.humidity < 0 || formData.humidity > 100 ||
            formData.ph < 0 || formData.ph > 14 ||
            formData.rainfall < 0
        ){setError('Please enter valid values within allowed ranges.');return;}
        setError(null);
        setLoading(true);

        try {    
            const reqToken = token||session?.accessToken;
            const payload = {
                n: Math.round(formData.n),
                p: Math.round(formData.p),
                k: Math.round(formData.k),
                temp: Math.round(formData.temp),
                humidity: Math.round(formData.humidity),
                ph: Math.round(formData.ph),
                rainfall: Math.round(formData.rainfall),
            };
            const response = await fetch('http://localhost:3001/api/farm/A1/inputs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${reqToken}`,
                },
                body: JSON.stringify({ crop_classifier_input: payload }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save data');
            }

            const result = await response.json();
            setLoading(false);
            // Update context state on success
            setModelA1Setup(true);
            setModelA1Data(formData);
            setModelA1Output(result.model_output.Prediction);
        } catch (err: any) {
            setLoading(false);
            setError(err.message || 'Something went wrong');
        }
    };

    return(
        <div className={`h-[77vh] w-full flex flex-col items-center justify-center relative z-5 rounded-xl text-white text-[2vh] ${gen.className}`}>
            <img src={`/bg_noise/darker_green.png`} alt="" className="absolute z-3 w-full h-full rounded-xl object-cover" />
            <div className="z-4 h-[10%] w-full flex items-end justify-center font-bold text-[4vh]">Crop Advisory</div>
            <div className="z-4 h-[5%] w-full flex items-center justify-center font-medium">Receive real-time crop advice tailored to your farm’s soil, weather, and environmental conditions</div>
            <div className="z-4 h-[85%] w-full flex items-center justify-center">
                
                <div className="h-full w-2/3 flex flex-col items-center justify-center">
                    <form onSubmit={handleSubmit} className="w-full h-[] flex items-center justify-start">
                        <div className="h-full w-1/2 flex flex-col items-center justify-center text-[2vh]">
                            {form1.map((f, i) => (
                            <div key={i}className="w-full flex flex-col items-start justify-start gap-[1vh] mt-[2vh] pl-[5vw]">
                                <label htmlFor={f.field} className="text-[2.54vh] text-white font-medium">{f.name}</label>
                                <input
                                id={f.field}
                                name={f.field}
                                value={formData[f.field]}
                                onChange={handleChange}
                                step="any"
                                className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white focus:outline-none focus:ring-2 focus:ring-white"
                                />
                            </div>
                            ))}

                        </div>
                        <div className="h-full w-1/2 flex flex-col items-center justify-start">
                            {form2.map((f, i) => (
                            <div key={i}className="w-full flex flex-col items-start justify-start gap-[1vh] mt-[2vh] pl-[5vw]">
                                <label htmlFor={f.field} className="text-[2.54vh] text-white font-medium">{f.name}</label>
                                <input
                                id={f.field}
                                name={f.field}
                                value={formData[f.field]}
                                onChange={handleChange}
                                step="any"
                                className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white focus:outline-none focus:ring-2 focus:ring-white"
                                />
                            </div>
                            ))}

                            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.054 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="w-auto h-auto mt-[5vh] flex items-center justify-center py-2 px-4 rounded-xl text-darker-green font-semibold cursor-pointer text-[2.27vh] hover:opacity-[0.77]"
                            style={{backgroundImage: "url('/bg_noise/white.png')", backgroundSize: 'cover'}}
                            >{loading ? 'Submitting...' : 'Submit'}</motion.button>
                        </div>
                    </form>
                    {error && <div className="text-white">{error}</div>}
                </div>


                <div className="h-full w-1/3 flex flex-col items-center justify-center">
                    <div className="h-[30%] w-full flex items-center justify-center text-[3vh] font-semibold z-4">History</div>
                    <div className="h-[70%] w-full flex flex-col items-center justify-start text-[2.54vh] font-medium z-4">
                        {modelA1data &&
                        <>
                        <ul>
                            <li>Nitrogen:<strong> {modelA1data.n}</strong> &nbsp;kg/ha</li>
                            <li>Phosphorous:<strong> {modelA1data.p}</strong>&nbsp;kg/ha</li>
                            <li>Potassium:<strong> {modelA1data.k}</strong>&nbsp;kg/ha</li>
                            <li>Temperature:<strong> {modelA1data.temp}</strong>&nbsp;°C</li>
                            <li>Humidity:<strong> {modelA1data.humidity}</strong>&nbsp;%</li>
                            <li>pH:<strong> {modelA1data.ph}</strong></li>
                            <li>Rainfall:<strong> {modelA1data.rainfall}</strong>&nbsp;mm</li>
                        </ul>
                        <p><strong>Predicted Crop:</strong></p>
                        <div className="h-auto w-auto p-[1vh] mt-[2vh] bg-white text-darker-green font-bold rounded-xl">{modelA1output}</div>
                        </>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}