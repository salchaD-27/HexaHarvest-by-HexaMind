# HexaHarvese: AI-Driven Agri-Livestock Digital Management Portal

## 🚀 Unified Solution for Smart Farming, Biosecurity, and Antimicrobial Stewardship

This project is a unified **AI-powered digital platform** that empowers small- and medium-scale **farmers and livestock managers**. It combines multiple compatible problem statements into a single solution offering **smart advisory**, **biosecurity risk assessments**, **antimicrobial usage monitoring**, and **crop yield prediction** — all accessible via **user-friendly dashboards** and backed by **machine learning**, **fullstack development**, and **DevOps automation**.

---

## 📌 Final Unified Problem Statement

**Development of an AI-Driven Agri-Livestock Digital Platform for Smart Advisory, Biosecurity, Antimicrobial Stewardship, and Yield Optimization**

---

## 🎯 Targeted & Compatible Problem Statements

| Problem Statement ID | Title                                                                                   |
|----------------------|-----------------------------------------------------------------------------------------|
| PS 25007             | Digital Farm Management Portal for Monitoring MRL & AMU in Livestock                   | 
| PS 25006             | Digital Farm Management Portal for Biosecurity in Pig & Poultry Farms                  | 
| PS 25010             | Smart Crop Advisory System for Small and Marginal Farmers                              | 
| PS 25044             | AI-Powered Crop Yield Prediction & Optimization                                        

---

## 🔧 Features by Problem Statement

### 🐄 PS 25007 – Antimicrobial Monitoring (AMU)
- Track antimicrobial use in treatment and feed
- Veterinary prescription and treatment log integration
- Withdrawal period & MRL (Maximum Residue Limit) alerts
- AMU trend dashboards (by species, region, time)

### 🐖 PS 25006 – Livestock Biosecurity
- Localized risk assessment tools & SOPs
- Breach logging and compliance tracking
- Real-time outbreak alerts and dashboards
- Training modules for pig & poultry farms

### 🌱 PS 25010 – Smart Crop Advisory
- Weather, soil, and market-based crop recommendations
- Fertilizer and irrigation guidance
- Pest/disease hints via image uploads
- Real-time weather alerts and market insights

### 🌾 PS 25044 – Yield Prediction & Optimization
- Predict crop yield using Regression, CNN, LSTM
- Input optimization recommendations
- API integration with historical and environmental data

---

## 🛠️ Tech Stack

| Layer       | Technology                                                                                     |
|-------------|-------------------------------------------------------------------------------------------------|
| **Frontend**| Next.js, Chart.js for visualization, TailwindCSS / Bootstrap                   |
| **Backend** | Express.js, JWT, REST, PostgreSQL
| **AIML**    | Scikit-learn, TensorFlow / PyTorch, OpenCV, CNN, LSTM, Regression, API-integrated prediction   |
| **DevOps**  | Docker, GitHub Actions|

---

## 👥 Team Roles & Responsibilities

### 🎨 Frontend Developer (F1)
- Build responsive farmer/authority dashboards
- Real-time visualization: alerts, charts, logs
- Image upload forms (for disease detection)
- Cross-device and accessibility support

### 🤖 AIML Engineers – Crop Advisory & Yield Prediction (A1.1, A1.2)
- Crop recommendation using weather, soil, market APIs
- Yield prediction using ML (Regression, CNN, LSTM)
- Pest/disease detection via image analysis
- Integrate models with backend APIs

### 🧬 AIML Engineers – Livestock Monitoring & Biosecurity (A2.1, A2.2)
- Analyze AMU logs & treatment records
- Biosecurity risk scoring & alert systems
- Compliance and trend dashboards

### 🧪 Backend & DevOps Engineer (BD1)
- API development & DB schema design
- Connect frontend ↔ ML models via REST APIs
- Integrate external APIs (weather, soil, market)
- CI/CD pipeline setup and cloud deployment
- Security, authentication, system monitoring

---

## 📡 System Architecture Overview

```text
[ Farmer/Authority UI ]
        |
        v
[ Frontend App (React/Next.js) ]
        |
        v
[ Backend API (Express/FastAPI) ] <------> [ ML Models (Crop, AMU, Yield, Pest) ]
        |
        v
[ Database (PostgreSQL/MongoDB) ]
        |
        v
[ External APIs (Weather, Soil, Market) ]

Deployment: Docker + GitHub Actions
