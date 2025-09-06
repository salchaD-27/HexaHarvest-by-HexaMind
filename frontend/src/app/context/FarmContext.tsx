'use client';
import { error } from 'console';
import { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Mode } from 'fs';
import { useAuth } from "./AuthContext";



export const disease_chicken_map: Record<number, string> = {
  1: 'Newcastle',
  2: 'Infectious Bursal',
  3: 'Coccidiosis',
  4: 'Coryza',
  5: 'Cholera',
  6: 'Fowl Pox',
  7: 'Worms',
  8: 'Parasites'
}

export const disease_pig_map: Record<number, string> = {
  1: 'Diarrhea',
  2: 'Mange',
  3: 'African Swine',
  4: 'Swine Erysipelas',
  5: 'Pneumonia',
  6: 'Swine Dysentery',
  7: 'Malnutrition',
  8: 'Brucellosis',
  9: 'Anthrax',
  10: 'Scouring',
  11: 'Foot Mouth'
}

export const antibiotics_map: Record<number, string> = {
  1: 'Penicillin',
  2: 'Oxytetracycline',
  3: 'Trimethoprim Sulfamethoxazole',
  4: 'Sulfadiazine',
  5: 'Enrofloxacin',
  6: 'Gentamicin',
  7: 'Amoxicillin',
  8: 'Doxycycline',
  9: 'Tylosin',
  10: 'Colistin',
  11: 'Penicillin1',
  12: 'Penicillin2',
  13: 'Oxytetracycline',
  14: 'Oxytetracycline1',
  15: 'Oxytetracycline2',
  16: 'Oxytetracycline3',
  17: 'Sulfamethoxazole1',
  18: 'Sulfamethoxazole2',
  19: 'Enrofloxacin',
  20: 'Doxycycline1',
  21: 'Doxycycline2',
  22: 'Oxytetracycline'
}
export const crops = ['Arecanut', 'Arhar/Tur', 'Bajra', 'Banana', 'Barley', 'Black pepper', 'Cardamom', 'Cashewnut', 'Castor seed', 'Coconut ', 'Coriander', 'Cotton(lint)', 'Cowpea(Lobia)', 'Dry chillies', 'Garlic', 'Ginger', 'Gram', 'Groundnut', 'Guar seed', 'Horse-gram', 'Jowar', 'Jute', 'Khesari', 'Linseed', 'Maize', 'Masoor', 'Mesta', 'Moong(Green Gram)', 'Moth', 'Niger seed', 'Oilseeds total', 'Onion', 'Other  Rabi pulses', 'Other Cereals', 'Other Kharif pulses', 'other oilseeds', 'Other Summer Pulses', 'Peas & beans (Pulses)', 'Potato', 'Ragi', 'Rapeseed &Mustard', 'Rice', 'Safflower', 'Sannhamp', 'Sesamum', 'Small millets', 'Soyabean', 'Sugarcane', 'Sunflower', 'Sweet potato', 'Tapioca', 'Tobacco', 'Turmeric', 'Urad', 'Wheat'];
export const seasons =['Autumn', 'Kharif', 'Rabi', 'Summer', 'Winter', 'Whole Year']
export const states =['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Sikkim',
 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
 'West Bengal']

export type ModelA1 = {
  n: number;         // >= 0
  p: number;         // >= 0
  k: number;         // >= 0
  temp: number;
  humidity: number;  // 0 to 100
  ph: number;        // 0 to 14
  rainfall: number;  // >= 0
};

export type ModelA2 = {
  crop: string;
  crop_year: number;
  season: 'Autumn' | 'Kharif' | 'Rabi' | 'Summer' | 'Winter' | 'Whole Year';
  state: string;
  area: number;       // >= 0
  production: number; // >= 0
  annual_rainfall: number; // >= 0
  fertilizer: number; // >= 0
  pesticide: number;  // >= 0
};

export type ModelB = {
  gender: 'Male' | 'Female';
  age: number;
  education: 'Primary' | 'Secondary' | 'Tertiary' | 'No Formal';
  farm_type: 'Pig Farm' | 'Poultry Farm' | 'Both';
  years_farming: number;
  follow_prescription: 0 | 1;
  check_expiry: 0 | 1;
  increase_dosage: 0 | 1;
  improvement_stop: 0 | 1;
  misuse_amr: 0 | 1;
  training_usage: 0 | 1;
  consult_veterinan: 0 | 1;
  amr_is_problem: 0 | 1;
  regulations: 0 | 1;
  withdraw: 0 | 1;
  importance_withdraw: 0 | 1;
  e_dispose: 'Return' | 'Incineration' | 'Waste' | 'Field';
  p_dispose: 'Return' | 'Incineration' | 'Waste' | 'Field';
  manure_mngt: 'Composting' | 'Fields' | 'Storing' | 'Landfill';
  store: 'Less Than 1 Week' | '1 To 2 Weeks' | 'More Than 2 Weeks' | 'Dont Store';
  disease_chicken: number[];          // List of ids from disease_chicken_list
  disease_chicken_count: number;      // Length of disease_chicken array
  disease_pig: number[];              // List of ids from disease_pig_list
  disease_pig_count: number;          // Length of disease_pig array
  antibiotics_used: number[];         // List of ids from antibiotics_list
  antibiotics_used_count: number;     // Length of antibiotics_used array
};

export type ModelBOutput = {
  compliance: number;
  risk: number;
};


type FarmContextType = {
  farmInit: boolean;
  setFarmInit: (farmInit: boolean) => void;
  modelA1setup: boolean;
  setModelA1Setup: (modelA1setup: boolean) => void;
  modelA2setup: boolean;
  setModelA2Setup: (modelA2setup: boolean) => void;
  modelBsetup: boolean;
  setModelBSetup: (modelBsetup: boolean) => void;
  
  modelA1data: ModelA1 | null;
  setModelA1Data: (modelA1data: ModelA1 | null) => void;
  modelA2data: ModelA2 | null;
  setModelA2Data: (modelA2data: ModelA2 | null) => void;
  modelBdata: ModelB | null;
  setModelBData: (modelBdata: ModelB | null) => void;
  
  modelA1output: String;
  setModelA1Output: (modelA1output: String) => void;
  modelA2output: number;
  setModelA2Output: (modelA2output: number) => void;
  modelBoutput: ModelBOutput|null;
  setModelBOutput: (modelBoutput: ModelBOutput|null) => void;
};

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, token, isLoggedIn } = useAuth();
  const {data:session} = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [farmInit, setFarmInit] = useState<boolean>(false);
  const [modelA1setup, setModelA1Setup] = useState<boolean>(false);
  const [modelA2setup, setModelA2Setup] = useState<boolean>(false);
  const [modelBsetup, setModelBSetup] = useState<boolean>(false);

  const [modelA1data, setModelA1Data] = useState<ModelA1 | null>(null);
  const [modelA2data, setModelA2Data] = useState<ModelA2 | null>(null);
  const [modelBdata, setModelBData] = useState<ModelB | null>(null);

  const [modelA1output, setModelA1Output] = useState<String>('');
  const [modelA2output, setModelA2Output] = useState<number>(0);
  const [modelBoutput, setModelBOutput] = useState<ModelBOutput|null>(null);

  // Effect A: Fetch setup flags when logged in or token changes
  useEffect(() => {
    if (!isLoggedIn || !token) return;

    const fetchSetup = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:3001/api/farm/setup', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch farm setup');
        const setupData = await res.json();

        // backend keys seem lowercase, so normalize
        setModelA1Setup(setupData.modela1setup ?? false);
        setModelA2Setup(setupData.modela2setup ?? false);
        setModelBSetup(setupData.modelbsetup ?? false);
      }catch (err: unknown) {
        if (err instanceof Error) {setError(err.message || 'Error fetching data');} 
        else{setError('An unexpected error occurred');}
      } finally {setLoading(false);}
    };

    fetchSetup();
  }, [isLoggedIn, token]);

  // Effect: When modelA1setup becomes true, fetch A1 input/output data
  useEffect(() => {
    if (!modelA1setup) return;

    const fetchModelA1Data = async () => {
      try {
        const reqToken = token||session?.accessToken
        const [dataRes, outputRes] = await Promise.all([
          fetch('http://localhost:3001/api/farm/A1/get/data', {
            headers: { Authorization: `Bearer ${reqToken}` }
          }),
          fetch('http://localhost:3001/api/farm/A1/get/output', {
            headers: { Authorization: `Bearer ${reqToken}` }
          }),
        ]);

        if (dataRes.ok) {
          const inputData = await dataRes.json();
          setModelA1Data(inputData.length ? inputData[0] : null);
        } else if (dataRes.status === 404) {
          setModelA1Data(null);
        }

        if (outputRes.ok) {
          const outputData = await outputRes.json();
          setModelA1Output(outputData.label);
        } else if (outputRes.status === 404) {
          setModelA1Output('');
        }
      }catch (err: unknown) {
        if (err instanceof Error) {setError(err.message || 'Error fetching data');} 
        else{setError('An unexpected error occurred');}
      }
    };

    fetchModelA1Data();
  }, [modelA1setup, token]);
  
  useEffect(() => {
    if (!modelA1setup) return;

    const fetchModelA2Data = async () => {
      try {
        const reqToken = token||session?.accessToken
        const [dataRes, outputRes] = await Promise.all([
          fetch('http://localhost:3001/api/farm/A2/get/data', {
            headers: { Authorization: `Bearer ${reqToken}` },
          }),
          fetch('http://localhost:3001/api/farm/A2/get/output', {
            headers: { Authorization: `Bearer ${reqToken}` },
          }),
        ]);

        if (dataRes.ok) {
          const inputData = await dataRes.json();
          setModelA2Data(inputData.length ? inputData[0] : null);
        } else if (dataRes.status === 404) {
          setModelA2Data(null);
        }

        if (outputRes.ok) {
          const outputData = await outputRes.json();
          setModelA2Output(outputData.yield);  // <--- corrected here
        } else if (outputRes.status === 404) {
          setModelA2Output(0);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Error fetching data');
        } else {
          setError('An unexpected error occurred');
        }
      }
    };

    fetchModelA2Data();
  }, [modelA1setup, token]);

  
  useEffect(() => {
    if (!modelBsetup) return;

    const fetchModelBData = async () => {
      try {
        const reqToken = token||session?.accessToken
        const [dataRes, outputRes] = await Promise.all([
          fetch('http://localhost:3001/api/farm/B/get/data', {
            headers: { Authorization: `Bearer ${reqToken}` },
          }),
          fetch('http://localhost:3001/api/farm/B/get/output', {
            headers: { Authorization: `Bearer ${reqToken}` },
          }),
        ]);

        if (dataRes.ok) {
          const inputData = await dataRes.json();
          console.log("inputData: ", inputData);
          console.log('Model B inputData:', inputData, typeof inputData);
          console.log('Is inputData a valid object?', typeof inputData === 'object' && inputData !== null);
          console.log('Keys:', Object.keys(inputData));
          setModelBData(inputData); // inputData is already an object
        } else if (dataRes.status === 404) {
          setModelBData(null);
        }
        
        if (outputRes.ok) {
          const outputData = await outputRes.json();
          setModelBOutput(outputData);
        } else if (outputRes.status === 404) {
          setModelBOutput(null);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Error fetching data');
        } else {
          setError('An unexpected error occurred');
        }
      }
    };

    fetchModelBData();
  }, [modelBsetup, token]);


  // Debug hooks to track state changes
  // useEffect(() => {
  //   console.log('modelA1setup changed:', modelA1setup);
  // }, [modelA1setup]);

  // useEffect(() => {
  //   console.log('modelA1data changed:', modelA1data);
  // }, [modelA1data]);

  // useEffect(() => {
  //   console.log('modelA1output changed:', modelA1output);
  // }, [modelA1output]);




  return (
    <FarmContext.Provider
      value={{
        farmInit,
        setFarmInit,

        modelA1setup,
        setModelA1Setup,
        modelA2setup,
        setModelA2Setup,
        modelBsetup,
        setModelBSetup,

        modelA1data,
        setModelA1Data,
        modelA2data,
        setModelA2Data,
        modelBdata,
        setModelBData,

        modelA1output,
        setModelA1Output,
        modelA2output,
        setModelA2Output,
        modelBoutput,
        setModelBOutput,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context){throw new Error('useAuth must be used within an AuthProvider');}
  return context;
};