import pandas as pd
import numpy as np
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import warnings
import os

warnings.filterwarnings('ignore')

# Set page configuration
st.set_page_config(
    page_title="Livestock Monitoring & Biosecurity AI",
    page_icon="🐄",
    layout="wide",
    initial_sidebar_state="expanded"
)


@st.cache_data
def load_data():
    if not os.path.exists('Dataset.csv'):
        st.warning("Dataset.csv not found. Please upload your data file.")
        uploaded_file = st.file_uploader("Upload your dataset (CSV format)", type="csv")
        if uploaded_file is not None:
            with open('Dataset.csv', 'wb') as f:
                f.write(uploaded_file.getbuffer())
            st.success("File uploaded successfully!")
        else:
            st.error("Please upload a CSV file to continue.")
            return None

    try:
        df = pd.read_csv('Dataset.csv')
        st.success("Dataset loaded successfully!")

        # Data preprocessing
        # Handle consent and missing values
        if 'consent' in df.columns:
            df = df[df['consent'] == 'Yes']

        # Create comprehensive compliance score
        compliance_columns_mapping = {
            'follow_prescription': 'follow_prescription',
            'check_expiry': 'check_expiry',
            'increase_dosage': 'increase_dosage',
            'improvement_stop': 'improvement_stop',
            'misuse_amr': 'misuse_amr',
            'training_usage': 'training_usage',
            'consult_veterinan': 'consult_veterinan',
            'amr_is_problem': 'amr_is_problem',
            'regulations': 'regulations',
            'withdraw': 'withdraw',
            'importance_withdraw': 'importance_withdraw'
        }

        for col in compliance_columns_mapping.values():
            if col in df.columns:
                df[col] = df[col].map({'Yes': 1, 'No': 0, 'I don\'t know': 0, 'I don\'t Know': 0})
            else:
                df[col] = 0

        compliance_columns = [col for col in compliance_columns_mapping.values()]
        df['compliance_score'] = (df[compliance_columns].sum(axis=1) / len(compliance_columns)) * 100

        # Create comprehensive risk score (0-100)
        risk_factors = {}

        # Antibiotic disposal practices
        disposal_columns = ['e_dispose_return', 'e_dispose_Incineration', 'e_dispose_as_waste',
                            'e_dispose_field', 'p_dispose_Reuse', 'p_dispose_Incineration',
                            'p_dispose_as_waste', 'p_dispose_field']

        for col in disposal_columns:
            if col in df.columns:
                # Higher risk for improper disposal methods
                if col in ['e_dispose_as_waste', 'e_dispose_field', 'p_dispose_Reuse', 'p_dispose_field']:
                    risk_factors[col] = 2  # Higher risk
                else:
                    risk_factors[col] = 1  # Lower risk
            else:
                df[col] = 0
                risk_factors[col] = 1

        # Manure management practices
        manure_columns = ['manure_mngt_composting', 'manure_mngt_fields', 'manure_mngt_Storing',
                          'manure_mngt_landfill', 'manure_mngt_Other']

        for col in manure_columns:
            if col in df.columns:
                # Higher risk for improper manure management
                if col in ['manure_mngt_fields', 'manure_mngt_landfill']:
                    risk_factors[col] = 2
                else:
                    risk_factors[col] = 1
            else:
                df[col] = 0
                risk_factors[col] = 1

        # Storage duration risk
        storage_columns = ['store_lessweek', 'store_1-2 weeks', 'store_morethan2', 'store_dont_store']
        for col in storage_columns:
            if col in df.columns:
                if col in ['store_lessweek', 'store_dont_store']:
                    risk_factors[col] = 2
                else:
                    risk_factors[col] = 1
            else:
                df[col] = 0
                risk_factors[col] = 1

        # Calculate weighted risk score
        risk_columns = list(risk_factors.keys())
        max_possible_risk = sum(risk_factors.values())

        # Calculate actual risk for each farm
        df['risk_score'] = 0
        for col in risk_columns:
            df['risk_score'] += df[col] * risk_factors[col]

        # Normalize to 0-100 scale
        df['risk_score'] = (df['risk_score'] / max_possible_risk) * 100

        # Identify high-risk farms (top 25%)
        risk_threshold = df['risk_score'].quantile(0.75)
        df['high_risk'] = df['risk_score'].apply(lambda x: 1 if x >= risk_threshold else 0)

        # Identify low-compliance farms (bottom 25%)
        compliance_threshold = df['compliance_score'].quantile(0.25)
        df['non_compliant'] = df['compliance_score'].apply(lambda x: 1 if x <= compliance_threshold else 0)

        # Process vaccination data
        chicken_disease_columns = [col for col in df.columns if 'disease_chicken' in col]
        pig_disease_columns = [col for col in df.columns if 'disease_pig' in col]

        if chicken_disease_columns:
            df['chicken_disease_count'] = df[chicken_disease_columns].sum(axis=1)
        else:
            df['chicken_disease_count'] = 0

        if pig_disease_columns:
            df['pig_disease_count'] = df[pig_disease_columns].sum(axis=1)
        else:
            df['pig_disease_count'] = 0

        # Process antibiotic usage data
        antibiotic_columns = [col for col in df.columns if col.startswith('used_')]
        if antibiotic_columns:
            df['antibiotic_variety'] = df[antibiotic_columns].sum(axis=1)
        else:
            df['antibiotic_variety'] = 0

        # Handle missing values in key columns
        required_columns = ['gender', 'age', 'education', 'farm_type', 'years_farming']
        for col in required_columns:
            if col not in df.columns:
                st.error(f"Required column '{col}' not found in dataset.")
                return None

            if col == 'years_farming':
                df['years_farming'] = pd.to_numeric(df['years_farming'], errors='coerce')
                df['years_farming'] = df['years_farming'].fillna(df['years_farming'].median())
            else:
                # For categorical columns, fill with mode
                df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 'Unknown')

        return df

    except Exception as e:
        st.error(f"Error loading dataset: {e}")
        return None


@st.cache_resource
def train_amu_model(df):
    feature_columns = [
        'gender', 'age', 'education', 'farm_type', 'years_farming',
        'chicken_disease_count', 'pig_disease_count', 'antibiotic_variety'
    ]

    # Filter to only include columns that exist in the dataframe
    feature_columns = [col for col in feature_columns if col in df.columns]

    X = df[feature_columns].copy()
    y = df['non_compliant']

    # Encode categorical variables
    for col in X.columns:
        if X[col].dtype == 'object':
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))

    X = X.fillna(0)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    return model, feature_columns, accuracy


@st.cache_resource
def train_biosecurity_model(df):
    feature_columns = [
        'gender', 'age', 'education', 'farm_type', 'years_farming',
        'chicken_disease_count', 'pig_disease_count', 'antibiotic_variety'
    ]

    # Add manure management columns if available
    manure_columns = ['manure_mngt_composting', 'manure_mngt_fields', 'manure_mngt_Storing',
                      'manure_mngt_landfill', 'store_lessweek', 'store_1-2 weeks',
                      'store_morethan2', 'store_dont_store']

    for col in manure_columns:
        if col in df.columns:
            feature_columns.append(col)

    # Filter to only include columns that exist in the dataframe
    feature_columns = [col for col in feature_columns if col in df.columns]

    X = df[feature_columns].copy()
    y = df['high_risk']

    for col in X.columns:
        if X[col].dtype == 'object':
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))

    X = X.fillna(0)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    return model, feature_columns, accuracy


def detect_anomalies(df):
    numerical_features = ['compliance_score', 'risk_score', 'years_farming',
                          'chicken_disease_count', 'pig_disease_count', 'antibiotic_variety']

    # Filter to only include columns that exist in the dataframe
    numerical_features = [col for col in numerical_features if col in df.columns]

    # Prepare data
    X = df[numerical_features].copy()

    # Handle missing values
    X = X.fillna(0)

    # Scale the data
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Detect anomalies using Isolation Forest
    iso_forest = IsolationForest(contamination=0.1, random_state=42)
    anomalies = iso_forest.fit_predict(X_scaled)

    df['anomaly'] = anomalies
    df['anomaly'] = df['anomaly'].apply(lambda x: 1 if x == -1 else 0)

    return df


# Main application
def main():
    st.title("🐖 Livestock Monitoring & Biosecurity AI System")
    st.markdown("""
    This AI-powered system monitors antimicrobial usage (AMU) compliance and assesses biosecurity risks 
    for livestock farms using machine learning models. It now includes enhanced vaccination data analysis
    and improved risk scoring.
    """)

    # Load data
    df = load_data()

    if df is None:
        st.stop()

    # Sidebar
    st.sidebar.header("Dashboard Controls")
    selected_page = st.sidebar.selectbox(
        "Select Page",
        ["Overview", "AMU Compliance", "Biosecurity Risk", "Anomaly Detection", "Farm Details", "Vaccination Analysis"]
    )

    # Overview page
    if selected_page == "Overview":
        st.header("Dataset Overview")

        col1, col2, col3, col4 = st.columns(4)

        with col1:
            st.metric("Total Farms", len(df))

        with col2:
            non_compliant = df['non_compliant'].sum()
            st.metric("Non-Compliant Farms", f"{non_compliant} ({non_compliant / len(df) * 100:.1f}%)")

        with col3:
            high_risk = df['high_risk'].sum()
            st.metric("High Risk Farms", f"{high_risk} ({high_risk / len(df) * 100:.1f}%)")

        with col4:
            avg_risk = df['risk_score'].mean()
            st.metric("Average Risk Score", f"{avg_risk:.1f}/100")

        # Farm type distribution
        if 'farm_type' in df.columns:
            fig = px.pie(df, names='farm_type', title='Farm Type Distribution')
            st.plotly_chart(fig, use_container_width=True)

        # Compliance vs Risk scatter plot
        fig = px.scatter(df, x='compliance_score', y='risk_score', color='farm_type',
                         title='Compliance Score vs Risk Score by Farm Type',
                         hover_data=['years_farming', 'chicken_disease_count', 'pig_disease_count'])
        st.plotly_chart(fig, use_container_width=True)

        # Risk score distribution
        fig = px.histogram(df, x='risk_score', nbins=20, title='Distribution of Risk Scores')
        st.plotly_chart(fig, use_container_width=True)

    # AMU Compliance page
    elif selected_page == "AMU Compliance":
        st.header("AMU Compliance Monitoring")

        # Train or load model
        model, feature_columns, accuracy = train_amu_model(df)

        st.subheader("Model Performance")
        st.metric("Accuracy", f"{accuracy * 100:.2f}%")

        # Show feature importance
        feature_importance = pd.DataFrame({
            'feature': feature_columns,
            'importance': model.feature_importances_
        }).sort_values('importance', ascending=False)

        fig = px.bar(feature_importance.head(10), x='importance', y='feature',
                     title='Top 10 Features for AMU Compliance Prediction')
        st.plotly_chart(fig, use_container_width=True)

        # Show non-compliant farms
        st.subheader("Non-Compliant Farms")
        non_compliant_df = df[df['non_compliant'] == 1]
        st.dataframe(non_compliant_df[['farm_type', 'compliance_score', 'years_farming',
                                       'chicken_disease_count', 'pig_disease_count']].head(10))

        # Compliance by farm type
        st.subheader("Compliance by Farm Type")
        compliance_by_type = df.groupby('farm_type')['compliance_score'].mean().reset_index()
        fig = px.bar(compliance_by_type, x='farm_type', y='compliance_score',
                     title='Average Compliance Score by Farm Type')
        st.plotly_chart(fig, use_container_width=True)

    # Biosecurity Risk page
    elif selected_page == "Biosecurity Risk":
        st.header("Biosecurity Risk Assessment")

        # Train or load model
        model, feature_columns, accuracy = train_biosecurity_model(df)

        st.subheader("Model Performance")
        st.metric("Accuracy", f"{accuracy * 100:.2f}%")

        # Show feature importance
        feature_importance = pd.DataFrame({
            'feature': feature_columns,
            'importance': model.feature_importances_
        }).sort_values('importance', ascending=False)

        fig = px.bar(feature_importance.head(10), x='importance', y='feature',
                     title='Top 10 Features for Biosecurity Risk Prediction')
        st.plotly_chart(fig, use_container_width=True)

        # Show high risk farms
        st.subheader("High Risk Farms")
        high_risk_df = df[df['high_risk'] == 1]
        st.dataframe(high_risk_df[['farm_type', 'risk_score', 'years_farming',
                                   'chicken_disease_count', 'pig_disease_count']].head(10))

        # Risk by farm type
        st.subheader("Risk by Farm Type")
        risk_by_type = df.groupby('farm_type')['risk_score'].mean().reset_index()
        fig = px.bar(risk_by_type, x='farm_type', y='risk_score',
                     title='Average Risk Score by Farm Type')
        st.plotly_chart(fig, use_container_width=True)

        # Risk factors breakdown
        st.subheader("Risk Factors Breakdown")
        risk_factors = ['e_dispose_as_waste', 'e_dispose_field', 'p_dispose_Reuse', 'p_dispose_field',
                        'manure_mngt_fields', 'manure_mngt_landfill', 'store_lessweek', 'store_dont_store']

        risk_factors = [col for col in risk_factors if col in df.columns]

        if risk_factors:
            risk_factor_data = []
            for factor in risk_factors:
                risk_factor_data.append({
                    'factor': factor,
                    'prevalence': df[factor].mean() * 100
                })

            risk_factor_df = pd.DataFrame(risk_factor_data)
            fig = px.bar(risk_factor_df, x='factor', y='prevalence',
                         title='Prevalence of Risk Factors Across All Farms')
            st.plotly_chart(fig, use_container_width=True)

    # Anomaly Detection page
    elif selected_page == "Anomaly Detection":
        st.header("Anomaly Detection")

        # Detect anomalies
        df_with_anomalies = detect_anomalies(df)
        anomalies = df_with_anomalies[df_with_anomalies['anomaly'] == 1]

        st.metric("Detected Anomalies", f"{len(anomalies)} ({len(anomalies) / len(df) * 100:.1f}%)")

        # Show anomalies
        st.subheader("Anomalous Farms")
        st.dataframe(anomalies[['farm_type', 'compliance_score', 'risk_score', 'years_farming',
                                'chicken_disease_count', 'pig_disease_count']])

        # 3D scatter plot of anomalies
        fig = px.scatter_3d(df_with_anomalies, x='compliance_score', y='risk_score',
                            z='years_farming', color='anomaly',
                            title='Anomaly Detection in 3D Space')
        st.plotly_chart(fig, use_container_width=True)

    # Vaccination Analysis page
    elif selected_page == "Vaccination Analysis":
        st.header("Vaccination and Disease Analysis")

        # Chicken disease analysis
        if 'chicken_disease_count' in df.columns:
            st.subheader("Chicken Disease Analysis")

            col1, col2 = st.columns(2)

            with col1:
                fig = px.histogram(df, x='chicken_disease_count',
                                   title='Distribution of Chicken Diseases per Farm')
                st.plotly_chart(fig, use_container_width=True)

            with col2:
                chicken_disease_by_type = df.groupby('farm_type')['chicken_disease_count'].mean().reset_index()
                fig = px.bar(chicken_disease_by_type, x='farm_type', y='chicken_disease_count',
                             title='Average Chicken Diseases by Farm Type')
                st.plotly_chart(fig, use_container_width=True)

        # Pig disease analysis
        if 'pig_disease_count' in df.columns:
            st.subheader("Pig Disease Analysis")

            col1, col2 = st.columns(2)

            with col1:
                fig = px.histogram(df, x='pig_disease_count',
                                   title='Distribution of Pig Diseases per Farm')
                st.plotly_chart(fig, use_container_width=True)

            with col2:
                pig_disease_by_type = df.groupby('farm_type')['pig_disease_count'].mean().reset_index()
                fig = px.bar(pig_disease_by_type, x='farm_type', y='pig_disease_count',
                             title='Average Pig Diseases by Farm Type')
                st.plotly_chart(fig, use_container_width=True)

        # Antibiotic usage analysis
        if 'antibiotic_variety' in df.columns:
            st.subheader("Antibiotic Usage Analysis")

            col1, col2 = st.columns(2)

            with col1:
                fig = px.histogram(df, x='antibiotic_variety',
                                   title='Distribution of Antibiotic Variety per Farm')
                st.plotly_chart(fig, use_container_width=True)

            with col2:
                antibiotic_by_type = df.groupby('farm_type')['antibiotic_variety'].mean().reset_index()
                fig = px.bar(antibiotic_by_type, x='farm_type', y='antibiotic_variety',
                             title='Average Antibiotic Variety by Farm Type')
                st.plotly_chart(fig, use_container_width=True)

            # Relationship between antibiotic use and disease prevalence
            if 'chicken_disease_count' in df.columns:
                fig = px.scatter(df, x='antibiotic_variety', y='chicken_disease_count',
                                 color='farm_type', title='Antibiotic Variety vs Chicken Diseases')
                st.plotly_chart(fig, use_container_width=True)

    # Farm Details page
    elif selected_page == "Farm Details":
        st.header("Farm Details")

        # Select a farm to view details
        farm_indices = [f"Farm {i}" for i in range(len(df))]
        selected_farm = st.selectbox("Select a Farm", options=farm_indices)
        farm_index = int(selected_farm.split(" ")[1])
        farm_data = df.iloc[farm_index]

        col1, col2 = st.columns(2)

        with col1:
            st.subheader("Basic Information")
            st.write(f"Farm Type: {farm_data.get('farm_type', 'N/A')}")
            st.write(f"Years Farming: {farm_data.get('years_farming', 'N/A')}")
            st.write(f"Education: {farm_data.get('education', 'N/A')}")
            st.write(f"Gender: {farm_data.get('gender', 'N/A')}")
            st.write(f"Age Group: {farm_data.get('age', 'N/A')}")

        with col2:
            st.subheader("Scores")
            st.write(f"Compliance Score: {farm_data.get('compliance_score', 'N/A'):.1f}/100")
            st.write(f"Risk Score: {farm_data.get('risk_score', 'N/A'):.1f}/100")
            st.write(f"Non-Compliant: {'Yes' if farm_data.get('non_compliant', 0) else 'No'}")
            st.write(f"High Risk: {'Yes' if farm_data.get('high_risk', 0) else 'No'}")
            if 'chicken_disease_count' in farm_data:
                st.write(f"Chicken Diseases: {farm_data.get('chicken_disease_count', 'N/A')}")
            if 'pig_disease_count' in farm_data:
                st.write(f"Pig Diseases: {farm_data.get('pig_disease_count', 'N/A')}")
            if 'antibiotic_variety' in farm_data:
                st.write(f"Antibiotic Variety: {farm_data.get('antibiotic_variety', 'N/A')}")

        # Show compliance details
        st.subheader("Compliance Details")
        compliance_data = {
            'Metric': ['Follow Prescription', 'Check Expiry', 'Increase Dosage',
                       'Stop When Improved', 'Misuse AMR', 'Training Usage',
                       'Consult Veterinarian', 'AMR is Problem', 'Regulations',
                       'Withdraw', 'Importance of Withdraw'],
            'Status': [farm_data.get('follow_prescription', 'N/A'),
                       farm_data.get('check_expiry', 'N/A'),
                       farm_data.get('increase_dosage', 'N/A'),
                       farm_data.get('improvement_stop', 'N/A'),
                       farm_data.get('misuse_amr', 'N/A'),
                       farm_data.get('training_usage', 'N/A'),
                       farm_data.get('consult_veterinan', 'N/A'),
                       farm_data.get('amr_is_problem', 'N/A'),
                       farm_data.get('regulations', 'N/A'),
                       farm_data.get('withdraw', 'N/A'),
                       farm_data.get('importance_withdraw', 'N/A')]
        }
        st.table(pd.DataFrame(compliance_data))

    # Footer
    st.sidebar.markdown("---")
    st.sidebar.info(
        "This AI system is designed to help monitor antimicrobial usage compliance "
        "and assess biosecurity risks in livestock farming operations. It now includes "
        "enhanced analysis of vaccination practices and disease prevalence."
    )


if __name__ == "__main__":
    main()