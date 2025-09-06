'use client';
import { Genos } from "next/font/google";
const gen = Genos({ subsets: ['latin'], weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] });
import { ModelA2, ModelB, ModelBOutput, useFarm, disease_chicken_map, disease_pig_map, antibiotics_map } from "../context/FarmContext";
import { useAuth } from "../context/AuthContext";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { motion } from 'framer-motion';

export default function Biosecurity(){
    const { token } = useAuth();
    const { data: session } = useSession();
    const {modelBsetup, modelBdata, setModelBSetup, setModelBData, setModelBOutput, modelBoutput} = useFarm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<ModelB>({
        gender: "Male",
        age: 18,
        education: "Primary",
        farm_type: "Pig Farm",
        years_farming: 0,

        follow_prescription: 0,
        check_expiry: 0,
        increase_dosage: 0,
        improvement_stop: 0,
        misuse_amr: 0,
        training_usage: 0,
        consult_veterinan: 0,
        amr_is_problem: 0,
        regulations: 0,
        withdraw: 0,
        importance_withdraw: 0,

        e_dispose: "Return",
        p_dispose: "Return",
        manure_mngt: "Composting",
        store: "Dont Store",

        disease_chicken: [0],
        disease_pig: [0],
        antibiotics_used: [0],
        disease_chicken_count: 0,
        disease_pig_count: 0,
        antibiotics_used_count: 0,
    });

    const renderOptions = (map: { [key: number]: string }) => {
        return Object.entries(map).map(([key, value]) => (
            <option key={key} value={key}>
            {value}
            </option>
        ));
    };

    const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
    const { name, type } = e.target;

    if (e.target instanceof HTMLSelectElement && e.target.multiple) {
        const selectedOptions = Array.from(e.target.selectedOptions).map((option) =>
        Number(option.value)
        );

        const countField = `${name}_count` as keyof ModelB;

        setFormData((prev) => ({
        ...prev,
        [name]: selectedOptions,
        [countField]: selectedOptions.length,
        }));
        return;
    }

    let val: any = e.target.value;

    if (type === "number") {
        val = Number(e.target.value);
    }

    if (
        [
        "follow_prescription",
        "check_expiry",
        "increase_dosage",
        "improvement_stop",
        "misuse_amr",
        "training_usage",
        "consult_veterinan",
        "amr_is_problem",
        "regulations",
        "withdraw",
        "importance_withdraw",
        ].includes(name)
    ) {
        val = e.target.value === "1" ? 1 : 0;
    }

    setFormData((prev) => ({
        ...prev,
        [name]: val,
    }));
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const filteredDiseaseChicken = formData.disease_chicken.filter(id => id > 0);
        const filteredDiseasePig = formData.disease_pig.filter(id => id > 0);
        const filteredAntibioticsUsed = formData.antibiotics_used.filter(id => id > 0);

        // Construct filtered formData for submission
        const filteredFormData = {
            ...formData,
            disease_chicken: filteredDiseaseChicken,
            disease_pig: filteredDiseasePig,
            antibiotics_used: filteredAntibioticsUsed,
            disease_chicken_count: filteredDiseaseChicken.length,
            disease_pig_count: filteredDiseasePig.length,
            antibiotics_used_count: filteredAntibioticsUsed.length,
        };

        // Basic validation (you can expand as needed)
        if (
            filteredFormData.age < 0 ||
            filteredFormData.disease_chicken_count < 0 ||
            filteredFormData.disease_pig_count < 0 ||
            filteredFormData.antibiotics_used_count < 0
        ) {
            setError("Please enter valid non-negative numbers.");
            return;
        }

        setError(null);
        setLoading(true);

        try {
        const reqToken = token || session?.accessToken;
        if (!reqToken) throw new Error("Authentication required");

        const response = await fetch("http://localhost:3001/api/farm/B/inputs", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${reqToken}`,
            },
            body: JSON.stringify({ biosecurity_input: filteredFormData }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to save data");
        }

        const result = await response.json();
        setLoading(false);
        setModelBSetup(true);
        setModelBData(formData);
        // console.log('model output: ', result);
        setModelBOutput(result.model_output);

        } catch (err: any) {
        setLoading(false);
        setError(err.message || "Something went wrong");
        }
    };
    
    return (
    <div
      className={`h-[154vh] w-full flex flex-col items-center justify-center relative z-5 rounded-xl text-white text-[2vh] ${gen.className}`}
    >
      <img
        src={`/bg_noise/darker_green.png`}
        alt=""
        className="absolute z-3 w-full h-full rounded-xl object-cover"
      />
      <div className="z-4 h-[5%] w-full flex items-end justify-center font-bold text-[4vh]">Biosecurity</div>
      <div className="z-4 h-[5%] w-full flex items-center justify-center font-medium text-center px-4">Monitor and improve your farm's biosecurity practices to reduce risks and enhance compliance.</div>
      <div className="z-4 h-[90%] w-full flex items-center justify-center px-8">
        <div className="h-full w-full flex flex-col items-center justify-center text-[2.27vh] font-medium">
          <form onSubmit={handleSubmit} className="w-full h-full flex items-center justify-center">
            <div className="h-full w-1/2 flex flex-col items-center justify-center gap-[2vh]">
                {/* Gender */}
                <label className="h-auto w-3/4 flex flex-col">
                Gender
                <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white focus:outline-none focus:ring-2 focus:ring-white"
                >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
                </label>

                {/* Age */}
                <label className="h-auto w-3/4 flex flex-col">
                Age
                <input
                    type="number"
                    name="age"
                    min={0}
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white focus:outline-none focus:ring-2 focus:ring-white"
                />
                </label>

                {/* Education */}
                <label className="h-auto w-3/4 flex flex-col">
                Education
                <select
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white focus:outline-none focus:ring-2 focus:ring-white"
                >
                    <option value="Primary">Primary</option>
                    <option value="Secondary">Secondary</option>
                    <option value="Tertiary">Tertiary</option>
                    <option value="No Formal">No Formal</option>
                </select>
                </label>

                {/* Farm Type */}
                <label className="h-auto w-3/4 flex flex-col">
                Farm Type
                <select
                    name="farm_type"
                    value={formData.farm_type}
                    onChange={handleChange}
                    className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white focus:outline-none focus:ring-2 focus:ring-white"
                >
                    <option value="Pig Farm">Pig Farm</option>
                    <option value="Poultry Farm">Poultry Farm</option>
                    <option value="Both">Both</option>
                </select>
                </label>

                {/* Years Farming */}
                <label className="h-auto w-3/4 flex flex-col">
                Years Farming
                <input
                    type="number"
                    min={0}
                    name="years_farming"
                    value={formData.years_farming}
                    onChange={handleChange}
                    className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white focus:outline-none focus:ring-2 focus:ring-white"
                />
                </label>
            
                {[
                "follow_prescription",
                "check_expiry",
                "increase_dosage",
                "improvement_stop",
                "misuse_amr",
                "training_usage",
                "consult_veterinan",
                "amr_is_problem",
                "regulations",
                "withdraw",
                "importance_withdraw",
                ].map((field) => (
                <label
                    key={field}
                    className="h-auto w-3/4 flex items-center justify-start gap-2 cursor-pointer select-none text-white"
                >
                    <input
                    type="checkbox"
                    name={field}
                    checked={formData[field as keyof ModelB] === 1}
                    onChange={(e) =>
                        setFormData((prev) => ({
                        ...prev,
                        [field]: e.target.checked ? 1 : 0,
                        }))
                    }
                    className="w-auto border border-white rounded p-[1.5vh] text-[2vh] text-white focus:outline-none focus:ring-2 focus:ring-white "
                    />
                    {field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </label>
                ))}
            </div>
            

            <div className="h-full w-1/2 flex flex-col items-center justify-center gap-[2vh]">
              <label className="h-auto w-3/4 flex flex-col">
                E Dispose
                <select
                  name="e_dispose"
                  value={formData.e_dispose}
                  onChange={handleChange}
                  className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <option value="Return">Return</option>
                  <option value="Incineration">Incineration</option>
                  <option value="Waste">Waste</option>
                  <option value="Field">Field</option>
                </select>
              </label>

              <label className="h-auto w-3/4 flex flex-col">
                P Dispose
                <select
                  name="p_dispose"
                  value={formData.p_dispose}
                  onChange={handleChange}
                  className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <option value="Return">Return</option>
                  <option value="Incineration">Incineration</option>
                  <option value="Waste">Waste</option>
                  <option value="Field">Field</option>
                </select>
              </label>

              <label className="h-auto w-3/4 flex flex-col">
                Manure Management
                <select
                  name="manure_mngt"
                  value={formData.manure_mngt}
                  onChange={handleChange}
                  className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <option value="Composting">Composting</option>
                  <option value="Fields">Fields</option>
                  <option value="Storing">Storing</option>
                  <option value="Landfill">Landfill</option>
                </select>
              </label>

              <label className="h-auto w-3/4 flex flex-col">
                Store Duration
                <select
                  name="store"
                  value={formData.store}
                  onChange={handleChange}
                  className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <option value="Less Than 1 Week">Less Than 1 Week</option>
                  <option value="1 To 2 Weeks">1 To 2 Weeks</option>
                  <option value="More Than 2 Weeks">More Than 2 Weeks</option>
                  <option value="Dont Store">Don't Store</option>
                </select>
              </label>

              <label className="h-auto w-3/4 flex flex-col">
                Disease Chicken
                <select
                    name="disease_chicken"
                    multiple
                    value={formData.disease_chicken.map(String)}
                    onChange={handleChange}
                    className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-white"
                >
                    {Object.entries(disease_chicken_map).map(([id, name]) => (
                    <option key={id} value={id}>
                        {name}
                    </option>
                    ))}
                </select>
                <div className="mt-2 text-sm">Selected: {formData.disease_chicken.map(id => disease_chicken_map[id]).join(", ")}</div>
                </label>

                <label className="h-auto w-3/4 flex flex-col">
                Disease Pig
                <select
                    name="disease_pig"
                    multiple
                    value={formData.disease_pig.map(String)}
                    onChange={handleChange}
                    className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-white"
                >
                    {Object.entries(disease_pig_map).map(([id, name]) => (
                    <option key={id} value={id}>
                        {name}
                    </option>
                    ))}
                </select>
                <div className="mt-2 text-sm">Selected: {formData.disease_pig.map(id => disease_pig_map[id]).join(", ")}</div>
                </label>

                <label className="h-auto w-3/4 flex flex-col">
                Antibiotics Used
                <select
                    name="antibiotics_used"
                    multiple
                    value={formData.antibiotics_used.map(String)}
                    onChange={handleChange}
                    className="w-full border border-white rounded p-[1.5vh] text-[2vh] text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-white"
                >
                    {Object.entries(antibiotics_map).map(([id, name]) => (
                    <option key={id} value={id}>
                        {name}
                    </option>
                    ))}
                </select>
                <div className="mt-2 text-sm">Selected: {formData.antibiotics_used.map(id => antibiotics_map[id]).join(", ")}</div>
                </label>



                <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.054 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-auto h-auto mt-8 px-6 py-2 rounded-xl text-darker-green font-semibold cursor-pointer text-[2.27vh] hover:opacity-[0.77]"
                style={{ backgroundImage: "url('/bg_noise/white.png')", backgroundSize: "cover" }}
                >
                {loading ? "Submitting..." : "Submit"}
                </motion.button>
            </div>
          </form>
            {error && <div className="mt-4 text-red-400">{error}</div>}
        </div>

        {/* History & Results */}
        <div className="h-full w-1/3 flex flex-col items-center justify-center text-[2.54vh] font-medium text-white ml-6 overflow-auto">
          <div className="h-[10%] w-full flex items-center justify-center text-[3vh] font-semibold">History</div>
          {modelBdata &&
            <>
              <ul className="space-y-1 text-left">
                <li>
                  Gender: <strong>{modelBdata.gender}</strong>
                </li>
                <li>
                  Age: <strong>{modelBdata.age}</strong>
                </li>
                <li>
                  Education: <strong>{modelBdata.education}</strong>
                </li>
                <li>
                  Farm Type: <strong>{modelBdata.farm_type}</strong>
                </li>
                <li>
                  Years Farming: <strong>{modelBdata.years_farming}</strong>
                </li>

                <li>
                  Follow Prescription: <strong>{modelBdata.follow_prescription ? "Yes" : "No"}</strong>
                </li>
                {/* Add more boolean fields here if desired */}

                <li>
                  E Dispose: <strong>{modelBdata.e_dispose}</strong>
                </li>
                <li>
                  P Dispose: <strong>{modelBdata.p_dispose}</strong>
                </li>
                <li>
                  Manure Management: <strong>{modelBdata.manure_mngt}</strong>
                </li>
                <li>
                  Store Duration: <strong>{modelBdata.store}</strong>
                </li>

                <li>
                  Disease Chicken Count: <strong>{modelBdata.disease_chicken_count}</strong>
                </li>
                <li>
                  Disease Pig Count: <strong>{modelBdata.disease_pig_count}</strong>
                </li>
                <li>
                  Antibiotics Used Count: <strong>{modelBdata.antibiotics_used_count}</strong>
                </li>
              </ul>


        </>
        }
        <div className="z-4 h-auto w-auto p-[1vh] mt-[5vh] text-[2.54vh] bg-white rounded-xl text-darker-green">Compliance: <strong>{modelBoutput?.compliance}</strong></div>
        <div className="z-4 h-auto w-auto p-[1vh] mt-[2vh] text-[2.54vh] bg-white rounded-xl text-darker-green">Risk: <strong>{modelBoutput?.risk}</strong></div>
        </div>
        </div>
    </div>
  );
}