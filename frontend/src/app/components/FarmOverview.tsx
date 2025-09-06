'use client';
import { useFarm } from "../context/FarmContext";
import { useAuth } from "../context/AuthContext";
import { motion } from 'framer-motion';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

import { Genos } from "next/font/google";
const gen = Genos({ subsets: ['latin'], weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] });

export default function FarmOverview() {
  const { modelA1data, modelBdata, modelA1output, modelBoutput } = useFarm();
  const { user } = useAuth();

  // Color schemes
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  const RISK_COLORS = {
    low: '#00C49F',
    medium: '#FFBB28',
    high: '#FF8042'
  };

  // Prepare data for charts
  const soilData = modelA1data ? [
    { name: 'Nitrogen (N)', value: modelA1data.n, optimal: 50 },
    { name: 'Phosphorus (P)', value: modelA1data.p, optimal: 30 },
    { name: 'Potassium (K)', value: modelA1data.k, optimal: 40 },
    { name: 'pH', value: modelA1data.ph, optimal: 6.5 },
  ] : [];

  const environmentalData = modelA1data ? [
    { name: 'Temperature', value: modelA1data.temp, optimal: 25 },
    { name: 'Humidity', value: modelA1data.humidity, optimal: 60 },
    { name: 'Rainfall', value: modelA1data.rainfall, optimal: 150 },
  ] : [];

  const complianceData = modelBdata ? [
    { name: 'Prescription Followed', value: modelBdata.follow_prescription ? 100 : 0 },
    { name: 'Expiry Checked', value: modelBdata.check_expiry ? 100 : 0 },
    { name: 'Veterinarian Consulted', value: modelBdata.consult_veterinan ? 100 : 0 },
    { name: 'Withdrawal Period', value: modelBdata.withdraw ? 100 : 0 },

    // E-disposal
    { name: 'e_dispose_return', value: modelBdata.e_dispose === 'Return' ? 100 : 0 },
    { name: 'e_dispose_Incineration', value: modelBdata.e_dispose === 'Incineration' ? 100 : 0 },
    { name: 'e_dispose_as_waste', value: modelBdata.e_dispose === 'Waste' ? 100 : 0 },
    { name: 'e_dispose_field', value: modelBdata.e_dispose === 'Field' ? 100 : 0 },

    // P-disposal
    { name: 'p_dispose_Return', value: modelBdata.p_dispose === 'Return' ? 100 : 0 },
    { name: 'p_dispose_Incineration', value: modelBdata.p_dispose === 'Incineration' ? 100 : 0 },
    { name: 'p_dispose_as_waste', value: modelBdata.p_dispose === 'Waste' ? 100 : 0 },
    { name: 'p_dispose_field', value: modelBdata.p_dispose === 'Field' ? 100 : 0 },

    // Manure management
    { name: 'manure_mngt_composting', value: modelBdata.manure_mngt === 'Composting' ? 100 : 0 },
    { name: 'manure_mngt_fields', value: modelBdata.manure_mngt === 'Fields' ? 100 : 0 },
    { name: 'manure_mngt_Storing', value: modelBdata.manure_mngt === 'Storing' ? 100 : 0 },
    { name: 'manure_mngt_landfill', value: modelBdata.manure_mngt === 'Landfill' ? 100 : 0 },

    // Storage duration
    { name: 'store_lessweek', value: modelBdata.store === 'Less Than 1 Week' ? 100 : 0 },
    { name: 'store_1-2 weeks', value: modelBdata.store === '1 To 2 Weeks' ? 100 : 0 },
    { name: 'store_morethan2', value: modelBdata.store === 'More Than 2 Weeks' ? 100 : 0 },
    { name: 'store_dont_store', value: modelBdata.store === 'Dont Store' ? 100 : 0 },
    ] : [];


  const riskFactors = modelBdata ? [
    { subject: 'Follow Prescription', A: modelBdata.follow_prescription ? 0 : 100, fullMark: 100 },
    { subject: 'Check Expiry', A: modelBdata.check_expiry ? 0 : 100, fullMark: 100 },
    { subject: 'Increase Dosage', A: modelBdata.increase_dosage ? 100 : 0, fullMark: 100 },
    { subject: 'Improvement Stop', A: modelBdata.improvement_stop ? 100 : 0, fullMark: 100 },
    { subject: 'Misuse AMR', A: modelBdata.misuse_amr ? 100 : 0, fullMark: 100 },
    { subject: 'Training Usage', A: modelBdata.training_usage ? 0 : 100, fullMark: 100 },
    { subject: 'Consult Veterinarian', A: modelBdata.consult_veterinan ? 0 : 100, fullMark: 100 },
    { subject: 'AMR Awareness', A: modelBdata.amr_is_problem ? 0 : 100, fullMark: 100 },
    { subject: 'Regulations', A: modelBdata.regulations ? 0 : 100, fullMark: 100 },
    { subject: 'Withdraw', A: modelBdata.withdraw ? 0 : 100, fullMark: 100 },
    { subject: 'Importance Withdraw', A: modelBdata.importance_withdraw ? 0 : 100, fullMark: 100 },
    ] : [];

  const getRiskLevel = (riskScore?: number) => {
    if (!riskScore) return 'Unknown';
    if (riskScore <= 0.25) return 'Low';
    if (riskScore <= 0.5) return 'Medium';
    return 'High';
  };

  const getRiskColor = (riskScore?: number) => {
    if (!riskScore) return '#666';
    if (riskScore <= 3) return RISK_COLORS.low;
    if (riskScore <= 7) return RISK_COLORS.medium;
    return RISK_COLORS.high;
  };

  return (
    <div className={`min-h-screen w-full rounded-xl relative z-10 ${gen.className}`}>
        {/* <img src={`/bg_noise/darker_green.png`} alt="" className="absolute inset-0 z-0 w-full h-full rounded-xl object-cover" /> */}
      <div className="w-full mx-auto z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 z-10"
        >
          <h1 className="text-4xl font-bold text-white mb-2 mt-[] text-[4vh] z-10">
            Farm Overview
          </h1>
          <p className="text-white text-[2.27vh] font-medium z-10">
            Comprehensive analytics for your farming operations
          </p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 z-10">
          {/* Soil Health Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-mid-green">Crop Advisory</h3>
              <div className="w-8 h-8 bg-mid-green rounded-full flex items-center justify-center">
                🌱
              </div>
            </div>
            <div className="text-3xl font-bold text-mid-green mb-2">
              {modelA1output || 'N/A'}
            </div>
            <p className="text-sm text-gray-600">Recommended crop</p>
          </motion.div>

          {/* Compliance Score Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-mid-green">Compliance</h3>
              <div className="w-8 h-8 bg-mid-green rounded-full flex items-center justify-center">
                📋
              </div>
            </div>
            <div className="text-3xl font-bold text-mid-green mb-2">
              {modelBoutput?.compliance != null 
                ? `${(modelBoutput.compliance * 100).toFixed(1)}%` 
                : 'N/A'}
            </div>
            <p className="text-sm text-gray-600">Best practices adherence</p>
          </motion.div>

          {/* Risk Level Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-mid-green">Risk Level</h3>
              <div className="w-8 h-8 bg-mid-green rounded-full flex items-center justify-center">
                ⚠️
              </div>
            </div>
            <div 
              className="text-3xl font-bold mb-2 text-mid-green"
            //   style={{ color: getRiskColor(modelBoutput?.risk) }}
            >
              {getRiskLevel(modelBoutput?.risk)}
            </div>
            <p className="text-sm text-gray-600">AMR risk assessment</p>
          </motion.div>

          {/* Farm Profile Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-mid-green">Farm Profile</h3>
              <div className="w-8 h-8 bg-mid-green rounded-full flex items-center justify-center">
                🚜
              </div>
            </div>
            <div className="text-xl font-bold text-mid-green mb-2">
              {modelBdata?.farm_type || 'N/A'}
            </div>
            <p className="text-sm text-gray-600">
              {modelBdata?.years_farming || 0} years experience
            </p>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Soil Nutrients Chart */}
          {modelA1data && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-mid-green mb-4">Soil Nutrient Levels</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={soilData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#025918" name="Current Level" />
                  <Bar dataKey="optimal" fill="#118C30" name="Optimal Level" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Risk Factors Radar */}
          {modelBdata && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-mid-green mb-4">Risk Factors Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={riskFactors}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar
                    name="Risk Score"
                    dataKey="A"
                    stroke="#025918"
                    fill="#118C30"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Compliance Metrics */}
          {modelBdata && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-mid-green mb-4">Compliance Metrics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={complianceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#025918">
                    {complianceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value === 100 ? '#025918' : '#025918'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Environmental Conditions */}
          {modelA1data && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-mid-green mb-4">Environmental Conditions</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={environmentalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#025918" name="Current" />
                  <Bar dataKey="optimal" fill="#118C30" name="Optimal" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>

        {/* Recommendations Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg mt-8"
        >
          <h3 className="text-lg font-semibold text-mid-green mb-4">Recommendations</h3>
          <div className="space-y-3">
            {modelBoutput?.risk && modelBoutput.risk > 5 && (
              <div className="flex items-start space-x-3 p-3 bg-darker-green rounded-lg">
                <span className="text-white">⚠️</span>
                <p className=" text-white font-medium text-[1.77vh]">
                  High AMR risk detected. Consider implementing stricter antibiotic usage protocols and staff training.
                </p>
              </div>
            )}
            
            {modelA1data && modelA1data.ph < 6 && (
              <div className="flex items-start space-x-3 p-3 bg-darker-green rounded-lg">
                <span className="text-white">🌱</span>
                <p className=" text-white font-medium text-[1.77vh]">
                  Soil pH is acidic. Consider adding lime to improve soil health and crop yield.
                </p>
              </div>
            )}

            {modelBdata && !modelBdata.training_usage && (
              <div className="flex items-start space-x-3 p-3 bg-darker-green rounded-lg">
                <span className="text-white">📚</span>
                <p className="text-white font-medium text-[1.77vh]">
                  No training recorded. Consider antibiotic usage training programs for farm staff.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}