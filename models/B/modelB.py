import json
import os
import sys
import pandas as pd
import numpy as np
import warnings
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings('ignore')

disease_chicken_map = {
    1: 'Newcastle',
    2: 'Infectious Bursal',
    3: 'Coccidiosis',
    4: 'Coryza',
    5: 'Cholera',
    6: 'Fowl Pox',
    7: 'Worms',
    8: 'Parasites'
}

disease_pig_map = {
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

antibiotics_map = {
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

gender_map = {'male': 0, 'female': 1, 'unknown': 2, 'Unknown': 2}
education_map = {'none': 0, 'primary': 1, 'secondary': 2, 'tertiary': 3, 'Unknown': 4, 'unknown': 4}
farm_type_map = {'small': 0, 'medium': 1, 'large': 2, 'Unknown': 3, 'unknown': 3}

# Antibiotic disposal practices
disposal_columns_weights = {
    'e_dispose_return': 1,
    'e_dispose_incineration': 1,
    'e_dispose_waste': 2,
    'e_dispose_field': 2,
    'p_dispose_return': 1,
    'p_dispose_incineration': 1,
    'p_dispose_waste': 2,
    'p_dispose_field': 2
}

# Manure management practices weights
manure_columns_weights = {
    'manure_mngt_composting': 1,
    'manure_mngt_fields': 2,
    'manure_mngt_storing': 1,
    'manure_mngt_landfill': 2
}

# Storage duration weights
storage_columns_weights = {
    'store_lessthan1week': 2,
    'store_1-2weeks': 1,
    'store_morethan2weeks': 1,
    'store_dontstore': 2
}


def convert_yes_no_to_binary(value):
    """
    Convert various yes/no formats to binary (0/1)
    """
    if isinstance(value, (int, float)):
        return 1 if value == 1 else 0
    
    if isinstance(value, str):
        value_lower = value.lower().strip()
        if value_lower in ['yes', 'y', 'true', '1', 'agree']:
            return 1
        elif value_lower in ['no', 'n', 'false', '0', 'disagree']:
            return 0
    
    return 0  # Default to 0 for any other case

def preprocess_input(raw_data, model_feature_columns=None, disease_chicken_list=None, disease_pig_list=None, antibiotics_list=None):
    """
    Corrected preprocessing function that actually processes the input data
    """
    if hasattr(raw_data, 'to_dict'):
        raw_json = raw_data.to_dict()
    else:
        raw_json = raw_data
    
    features = {}
    
    print(f"DEBUG: Processing raw data with keys: {list(raw_json.keys())}", file=sys.stderr)

    # 1. Process basic demographic fields
    basic_fields = ['gender', 'age', 'education', 'farm_type', 'years_farming']
    for field in basic_fields:
        if field in raw_json:
            features[field] = raw_json[field]
        else:
            features[field] = 'Unknown' if field in ['gender', 'education', 'farm_type'] else 0
    
    # Convert numeric fields
    for field in ['age', 'years_farming']:
        if field in features:
            try:
                features[field] = int(features[field])
            except:
                features[field] = 0

    # 2. Process compliance fields (yes/no to 1/0)
    compliance_fields = [
        'follow_prescription', 'check_expiry', 'increase_dosage', 'improvement_stop',
        'misuse_amr', 'training_usage', 'consult_veterinan', 'amr_is_problem',
        'regulations', 'withdraw', 'importance_withdraw'
    ]
    
    for field in compliance_fields:
        if field in raw_json:
            val = raw_json[field]
            if isinstance(val, (int, float)):
                features[field] = 1 if val == 1 else 0
            elif isinstance(val, str):
                val_lower = val.lower().strip()
                features[field] = 1 if val_lower in ['yes', 'y', 'true', '1', 'agree'] else 0
            else:
                features[field] = 0
        else:
            features[field] = 0

    # 3. Process disposal methods
    disposal_mapping = {
        'e_dispose': {
            'return': 'e_dispose_return',
            'incineration': 'e_dispose_Incineration',
            'waste': 'e_dispose_as_waste',
            'field': 'e_dispose_field'
        },
        'p_dispose': {
            'return': 'p_dispose_Reuse',
            'incineration': 'p_dispose_Incineration',
            'waste': 'p_dispose_as_waste',
            'field': 'p_dispose_field'
        }
    }
    
    for dispose_type, mapping in disposal_mapping.items():
        if dispose_type in raw_json:
            value = str(raw_json[dispose_type]).lower()
            for option, column_name in mapping.items():
                features[column_name] = 1 if option in value else 0
        else:
            # Set all to 0 if not provided
            for column_name in mapping.values():
                features[column_name] = 0

    # 4. Process manure management
    manure_mapping = {
        'composting': 'manure_mngt_composting',
        'fields': 'manure_mngt_fields',
        'storing': 'manure_mngt_Storing',
        'landfill': 'manure_mngt_landfill'
    }
    
    if 'manure_mngt' in raw_json:
        manure_val = str(raw_json['manure_mngt']).lower()
        for option, column_name in manure_mapping.items():
            features[column_name] = 1 if option in manure_val else 0
    else:
        for column_name in manure_mapping.values():
            features[column_name] = 0

    # 5. Process storage
    storage_mapping = {
        'lessthan1week': 'store_lessweek',
        'lessweek': 'store_lessweek',
        '1-2weeks': 'store_1-2 weeks',
        '1-2 weeks': 'store_1-2 weeks',
        'morethan2weeks': 'store_morethan2',
        'morethan2': 'store_morethan2',
        'dontstore': 'store_dont_store',
        'dont_store': 'store_dont_store'
    }
    
    if 'store' in raw_json:
        store_val = str(raw_json['store']).lower().replace(' ', '')
        for option, column_name in storage_mapping.items():
            if option in store_val:
                features[column_name] = 1
                break
        else:
            # If no match found, set all to 0
            for column_name in set(storage_mapping.values()):
                features[column_name] = 0
    else:
        for column_name in set(storage_mapping.values()):
            features[column_name] = 0

    # 6. Process diseases and antibiotics
    # Chicken diseases
    chicken_diseases = []
    if 'disease_chicken' in raw_json:
        chicken_data = raw_json['disease_chicken']
        if isinstance(chicken_data, list):
            chicken_diseases = chicken_data
        elif isinstance(chicken_data, str):
            try:
                chicken_diseases = eval(chicken_data)
            except:
                chicken_diseases = []
    
    # Pig diseases
    pig_diseases = []
    if 'disease_pig' in raw_json:
        pig_data = raw_json['disease_pig']
        if isinstance(pig_data, list):
            pig_diseases = pig_data
        elif isinstance(pig_data, str):
            try:
                pig_diseases = eval(pig_data)
            except:
                pig_diseases = []
    
    # Antibiotics
    antibiotics = []
    if 'antibiotics_used' in raw_json:
        ab_data = raw_json['antibiotics_used']
        if isinstance(ab_data, list):
            antibiotics = ab_data
        elif isinstance(ab_data, str):
            try:
                antibiotics = eval(ab_data)
            except:
                antibiotics = []

    # Create disease columns
    for i in range(1, 9):  # Chicken diseases 1-8
        features[f'disease_chicken_{i}'] = 1 if i in chicken_diseases else 0
    
    for i in range(1, 12):  # Pig diseases 1-11
        features[f'disease_pig_{i}'] = 1 if i in pig_diseases else 0
    
    # Create antibiotic columns
    for i in range(1, 23):  # Antibiotics 1-22
        features[f'used_{i}'] = 1 if i in antibiotics else 0

    # 7. Create count fields
    features['chicken_disease_count'] = len(chicken_diseases)
    features['pig_disease_count'] = len(pig_diseases)
    features['antibiotic_variety'] = len(antibiotics)

    # 8. Encode categorical variables
    gender_map = {'male': 0, 'female': 1, 'unknown': 2, 'Unknown': 2}
    education_map = {'none': 0, 'primary': 1, 'secondary': 2, 'tertiary': 3, 'Unknown': 4, 'unknown': 4}
    farm_type_map = {'small': 0, 'medium': 1, 'large': 2, 'Unknown': 3, 'unknown': 3}
    
    if 'gender' in features:
        features['gender'] = gender_map.get(str(features['gender']).lower(), 2)
    if 'education' in features:
        features['education'] = education_map.get(str(features['education']).lower(), 4)
    if 'farm_type' in features:
        features['farm_type'] = farm_type_map.get(str(features['farm_type']).lower(), 3)

    # 9. Calculate compliance score
    compliance_score_fields = [
        'follow_prescription', 'check_expiry', 'increase_dosage', 'improvement_stop',
        'misuse_amr', 'training_usage', 'consult_veterinan', 'amr_is_problem',
        'regulations', 'withdraw', 'importance_withdraw'
    ]
    
    compliance_sum = sum(features.get(field, 0) for field in compliance_score_fields)
    max_compliance = len(compliance_score_fields)
    features['compliance_score'] = (compliance_sum / max_compliance) * 100 if max_compliance > 0 else 0

    # 10. Calculate risk score
    risk_columns = [
        'e_dispose_as_waste', 'e_dispose_field', 'p_dispose_Reuse', 'p_dispose_field',
        'manure_mngt_fields', 'manure_mngt_landfill', 'store_lessweek', 'store_dont_store'
    ]
    
    risk_weights = {col: 2 for col in risk_columns}
    risk_score_num = sum(features.get(col, 0) * risk_weights.get(col, 1) for col in risk_columns)
    max_risk = sum(risk_weights.values())
    features['risk_score'] = (risk_score_num / max_risk) * 100 if max_risk > 0 else 0

    print(f"DEBUG: Processed features keys: {list(features.keys())}", file=sys.stderr)
    print(f"DEBUG: compliance_score: {features.get('compliance_score', 'MISSING')}", file=sys.stderr)
    print(f"DEBUG: risk_score: {features.get('risk_score', 'MISSING')}", file=sys.stderr)

    # 11. Ensure all expected model columns are present
    if model_feature_columns:
        for col in model_feature_columns:
            if col not in features:
                features[col] = 0
                print(f"DEBUG: Added missing column: {col}", file=sys.stderr)

    # 12. Create DataFrame in the correct order
    if model_feature_columns:
        df = pd.DataFrame([features], columns=model_feature_columns)
    else:
        df = pd.DataFrame([features])
    
    print(f"DEBUG: Final DataFrame columns: {list(df.columns)}", file=sys.stderr)
    return df

# def convert_np_int(obj):
#     """Convert numpy types to native Python types for JSON serialization"""
#     if isinstance(obj, (np.integer, np.int64)):
#         return int(obj)
#     elif isinstance(obj, (np.floating, np.float64)):
#         return float(obj)
#     elif isinstance(obj, np.ndarray):
#         return obj.tolist()
#     raise TypeError(f"Object of type {type(obj)} is not JSON serializable")
def convert_np_int(obj):
    import numpy as np
    if isinstance(obj, np.generic):
        return obj.item()
    return obj




def debug_compliance_calculation(raw_json):
    """
    Debug function to see why compliance_score is 0
    """
    print("=== DEBUG: Compliance Calculation ===", file=sys.stderr)
    
    compliance_fields = [
        'follow_prescription', 'check_expiry', 'increase_dosage', 'improvement_stop',
        'misuse_amr', 'training_usage', 'consult_veterinan', 'amr_is_problem',
        'regulations', 'withdraw', 'importance_withdraw'
    ]
    
    compliance_sum = 0
    for field in compliance_fields:
        val = raw_json.get(field, 0)
        field_value = 0
        
        if isinstance(val, (int, float)):
            field_value = 1 if val == 1 else 0
        elif isinstance(val, str):
            val_lower = val.lower().strip()
            field_value = 1 if val_lower in ['yes', 'y', 'true', '1', 'agree'] else 0
        
        print(f"{field}: {val} -> {field_value}", file=sys.stderr)
        compliance_sum += field_value
    
    max_compliance = len(compliance_fields)
    compliance_score = (compliance_sum / max_compliance) * 100 if max_compliance > 0 else 0
    
    print(f"Compliance sum: {compliance_sum}/{max_compliance}", file=sys.stderr)
    print(f"Compliance score: {compliance_score}", file=sys.stderr)
    return compliance_score

def debug_risk_calculation(raw_json):
    """
    Debug function to see why risk_score is 0
    """
    print("=== DEBUG: Risk Calculation ===", file=sys.stderr)
    
    # Process disposal methods
    e_dispose = str(raw_json.get('e_dispose', '')).lower()
    p_dispose = str(raw_json.get('p_dispose', '')).lower()
    
    print(f"e_dispose: {e_dispose}", file=sys.stderr)
    print(f"p_dispose: {p_dispose}", file=sys.stderr)
    
    risk_columns = [
        'e_dispose_as_waste', 'e_dispose_field', 'p_dispose_Reuse', 'p_dispose_field',
        'manure_mngt_fields', 'manure_mngt_landfill', 'store_lessweek', 'store_dont_store'
    ]
    
    risk_values = {}
    risk_weights = {col: 2 for col in risk_columns}
    
    # Check disposal methods
    risk_values['e_dispose_as_waste'] = 1 if 'waste' in e_dispose else 0
    risk_values['e_dispose_field'] = 1 if 'field' in e_dispose else 0
    risk_values['p_dispose_Reuse'] = 1 if 'return' in p_dispose or 'reuse' in p_dispose else 0
    risk_values['p_dispose_field'] = 1 if 'field' in p_dispose else 0
    
    # Check manure management
    manure_val = str(raw_json.get('manure_mngt', '')).lower()
    risk_values['manure_mngt_fields'] = 1 if 'fields' in manure_val else 0
    risk_values['manure_mngt_landfill'] = 1 if 'landfill' in manure_val else 0
    
    # Check storage
    store_val = str(raw_json.get('store', '')).lower().replace(' ', '')
    risk_values['store_lessweek'] = 1 if any(x in store_val for x in ['lessthan1week', 'lessweek']) else 0
    risk_values['store_dont_store'] = 1 if any(x in store_val for x in ['dontstore', 'dont_store']) else 0
    
    risk_score_num = 0
    for col in risk_columns:
        value = risk_values.get(col, 0)
        weight = risk_weights.get(col, 1)
        risk_score_num += value * weight
        print(f"{col}: {value} * {weight} = {value * weight}", file=sys.stderr)
    
    max_risk = sum(risk_weights.values())
    risk_score = (risk_score_num / max_risk) * 100 if max_risk > 0 else 0
    
    print(f"Risk score sum: {risk_score_num}/{max_risk}", file=sys.stderr)
    print(f"Risk score: {risk_score}", file=sys.stderr)
    return risk_score







def predict_from_json(json_data, model_path='model.pkl'):
    """
    Load trained model and make prediction from JSON input
    """
    try:
        # Load the trained model
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(BASE_DIR, 'model.pkl')
        with open(model_path, 'rb') as f:
            model_data = pickle.load(f)
    except Exception as e:
        raise Exception(f"Error loading model: {e}")
    
    # Extract models and feature information
    amu_model = model_data.get('amu_model')
    bio_model = model_data.get('bio_model')
    amu_features = model_data.get('amu_features', [])
    bio_features = model_data.get('bio_features', [])
    
    if amu_model is None or bio_model is None:
        raise Exception("Loaded model data is missing required components")
    
    # Disease and antibiotic lists
    disease_chicken_list = [1, 2, 3, 4, 5, 6, 7, 8]
    disease_pig_list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    antibiotics_list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
    
    # Get all possible features
    all_features = list(set(list(amu_features) + list(bio_features)))

    # Debug the score calculations
    if hasattr(json_data, 'to_dict'):
        raw_json = json_data.to_dict()
    else:
        raw_json = json_data
    
    compliance_score = debug_compliance_calculation(raw_json)
    risk_score = debug_risk_calculation(raw_json)

    
    # Preprocess input to get scores first
    df_with_scores = preprocess_input(
        json_data, 
        None,  # Don't constrain by model features
        disease_chicken_list, 
        disease_pig_list, 
        antibiotics_list
    )
    
    # Extract scores
    compliance_score = df_with_scores['compliance_score'].iloc[0]
    risk_score = df_with_scores['risk_score'].iloc[0]
    
    # Now preprocess with model features for prediction
    df_processed = preprocess_input(
        json_data, 
        all_features,  # Constrain by model features
        disease_chicken_list, 
        disease_pig_list, 
        antibiotics_list
    )
    
    # Prepare data for each model
    df_amu = df_processed[list(amu_features)] if len(amu_features) > 0 else df_processed
    df_bio = df_processed[list(bio_features)] if len(bio_features) > 0 else df_processed
    
    # Make predictions
    amu_pred = amu_model.predict(df_amu)[0]
    bio_pred = bio_model.predict(df_bio)[0]
    
    # Get prediction probabilities
    amu_proba = amu_model.predict_proba(df_amu)[0]
    bio_proba = bio_model.predict_proba(df_bio)[0]
    
    return {
        # 'amu_prediction': int(amu_pred),
        # 'biosecurity_prediction': int(bio_pred),
        'compliance': float(max(amu_proba)),
        'risk': float(max(bio_proba)),
        # 'compliance_score': float(compliance_score),
        # 'risk_score': float(risk_score),
        # 'interpretation': {
        #     'amu_prediction': 'Non-compliant' if amu_pred == 1 else 'Compliant',
        #     'biosecurity_prediction': 'High Risk' if bio_pred == 1 else 'Low Risk'
        # }
    }

# Example usage function
def main():
    """
    Example of how to use the prediction function with correct yes/no fields
    """
    # Make prediction
    input_json_str = sys.stdin.read()
    input_data = json.loads(input_json_str)

    # input_data = {
    #     "gender": "male",
    #     "age": 35,
    #     "education": "secondary",
    #     "farm_type": "pigfarm",
    #     "years_farming": 10,
    #     "follow_prescription": 1,
    #     "check_expiry": 1,
    #     "increase_dosage": 0,
    #     "improvement_stop": 0,
    #     "misuse_amr": 0,
    #     "training_usage": 1,
    #     "consult_veterinan": 1,
    #     "amr_is_problem": 0,
    #     "regulations": 1,
    #     "withdraw": 1,
    #     "importance_withdraw": 2,
    #     "e_dispose": "return",
    #     "p_dispose": "incineration",
    #     "manure_mngt": "composting",
    #     "store": "1-2 weeks",
    #     "disease_chicken": [1, 3],
    #     "disease_pig": [2],
    #     "antibiotics_used": [1, 5]
    # }


    result = predict_from_json(input_data, './model.pkl')
    # print("result: ", result)
    print(json.dumps(result, indent=2, default=convert_np_int))

if __name__ == "__main__":
    main()