# import json
# import sys
# import pandas as pd
# import numpy as np
# import warnings
# import os
# from sklearn.ensemble import RandomForestClassifier
# from sklearn.preprocessing import LabelEncoder
# from sklearn.model_selection import train_test_split
# from sklearn.metrics import accuracy_score
# from sklearn.ensemble import IsolationForest
# from sklearn.preprocessing import StandardScaler
# import pandas as pd

# warnings.filterwarnings('ignore')

# disease_chicken_map = {
#     1: 'Newcastle',
#     2: 'Infectious Bursal',
#     3: 'Coccidiosis',
#     4: 'Coryza',
#     5: 'Cholera',
#     6: 'Fowl Pox',
#     7: 'Worms',
#     8: 'Parasites'
# }

# disease_pig_map = {
#     1:'Diarrhea',
#     2:'Mange',
#     3:'African Swine',
#     4:'Swine Erysipelas',
#     5:'Pneumonia',
#     6:'Swine Dysentery',
#     7:'Malnutrition',
#     8:'Brucellosis',
#     9:'Anthrax',
#     10:'Scouring',
#     11:'Foot Mouth'
# }

# antibiotics_map = {
#     1: 'Penicillin',
#     2: 'Oxytetracycline',
#     3: 'Trimethoprim Sulfamethoxazole',
#     4: 'Sulfadiazine',
#     5: 'Enrofloxacin',
#     6: 'Gentamicin',
#     7: 'Amoxicillin',
#     8: 'Doxycycline',
#     9: 'Tylosin',
#     10: 'Colistin',
#     11: 'Penicillin1',
#     12: 'Penicillin2',
#     13: 'Oxytetracycline',
#     14: 'Oxytetracycline1',
#     15: 'Oxytetracycline2',
#     16: 'Oxytetracycline3',
#     17: 'Sulfamethoxazole1',
#     18: 'Sulfamethoxazole2',
#     19: 'Enrofloxacin',
#     20: 'Doxycycline1',
#     21: 'Doxycycline2',
#     22: 'Oxytetracycline'
# }

# gender_map = {'male': 0, 'female': 1, 'unknown': 2, 'Unknown': 2}
# education_map = {'none': 0, 'primary': 1, 'secondary': 2, 'tertiary': 3, 'Unknown': 4, 'unknown': 4}
# farm_type_map = {'small': 0, 'medium': 1, 'large': 2, 'Unknown': 3, 'unknown': 3}

# # Antibiotic disposal practices
# disposal_columns_weights = {
#     'e_dispose_return': 1,
#     'e_dispose_incineration': 1,
#     'e_dispose_waste': 2,
#     'e_dispose_field': 2,
#     'p_dispose_return': 1,
#     'p_dispose_incineration': 1,
#     'p_dispose_waste': 2,
#     'p_dispose_field': 2
# }

# # Manure management practices weights
# manure_columns_weights = {
#     'manure_mngt_composting': 1,
#     'manure_mngt_fields': 2,
#     'manure_mngt_storing': 1,
#     'manure_mngt_landfill': 2
# }

# # Storage duration weights
# storage_columns_weights = {
#     'store_lessthan1week': 2,
#     'store_1-2weeks': 1,
#     'store_morethan2weeks': 1,
#     'store_dontstore': 2
# }



# def preprocess_input(raw_json, model_feature_columns, disease_chicken_list=None, disease_pig_list=None, antibiotics_list=None):
#     """
#     raw_json: dict input matching your db field format
#     model_feature_columns: list of columns expected by your trained model
#     disease_chicken_list: list of valid chicken disease IDs (ints or strings)
#     disease_pig_list: list of valid pig disease IDs
#     antibiotics_list: list of valid antibiotic IDs

#     Returns: single-row pd.DataFrame with columns matching model_feature_columns
#     """

#     features = {}

#     # Scalar fields with default fallback
#     scalar_fields = [
#         'gender', 'age', 'education', 'farm_type', 'years_farming',
#         'follow_prescription', 'check_expiry', 'increase_dosage', 'improvement_stop',
#         'misuse_amr', 'training_usage', 'consult_veterinan', 'amr_is_problem',
#         'regulations', 'withdraw', 'importance_withdraw'
#     ]

#     for f in scalar_fields:
#         if f in ['gender', 'education', 'farm_type']:
#             features[f] = raw_json.get(f, 'Unknown')
#         else:
#             # Try to convert to int, fallback to 0
#             val = raw_json.get(f, 0)
#             try:
#                 features[f] = int(val)
#             except:
#                 features[f] = 0

#     # One-hot encode disposal fields
#     e_dispose_options = ['return', 'incineration', 'waste', 'field']
#     p_dispose_options = ['return', 'incineration', 'waste', 'field']

#     manure_options = ['composting', 'fields', 'storing', 'landfill']

#     store_options = ['lessthan1week', '1-2weeks', 'morethan2weeks', 'dontstore']

#     # e_dispose
#     e_dispose_val = raw_json.get('e_dispose', '').lower()
#     for val in e_dispose_options:
#         col = f"e_dispose_{val}"
#         features[col] = 1 if e_dispose_val == val else 0

#     # p_dispose
#     p_dispose_val = raw_json.get('p_dispose', '').lower()
#     for val in p_dispose_options:
#         col = f"p_dispose_{val}"
#         features[col] = 1 if p_dispose_val == val else 0

#     # manure_mngt
#     manure_val = raw_json.get('manure_mngt', '').lower()
#     for val in manure_options:
#         col = f"manure_mngt_{val}"
#         features[col] = 1 if manure_val == val else 0

#     # store
#     store_val = raw_json.get('store', '').lower().replace(' ', '')
#     for val in store_options:
#         col = f"store_{val}"
#         features[col] = 1 if store_val == val else 0

#     # Diseases and Antibiotics one-hot encoding
#     chicken_disease_ids = raw_json.get('disease_chicken', [])
#     if not isinstance(chicken_disease_ids, list):
#         chicken_disease_ids = []

#     pig_disease_ids = raw_json.get('disease_pig', [])
#     if not isinstance(pig_disease_ids, list):
#         pig_disease_ids = []

#     antibiotics_used_ids = raw_json.get('antibiotics_used', [])
#     if not isinstance(antibiotics_used_ids, list):
#         antibiotics_used_ids = []

#     for disease_id in (disease_chicken_list or []):
#         col = f'disease_chicken_{disease_id}'
#         features[col] = 1 if disease_id in chicken_disease_ids else 0

#     for disease_id in (disease_pig_list or []):
#         col = f'disease_pig_{disease_id}'
#         features[col] = 1 if disease_id in pig_disease_ids else 0

#     for antibiotic_id in (antibiotics_list or []):
#         col = f'used_{antibiotic_id}'
#         features[col] = 1 if antibiotic_id in antibiotics_used_ids else 0

#     features['disease_chicken_count'] = len(chicken_disease_ids)
#     features['disease_pig_count'] = len(pig_disease_ids)
#     features['antibiotic_variety'] = len(antibiotics_used_ids)


#     features['gender'] = gender_map.get(str(features.get('gender')).lower(), 2)
#     features['education'] = education_map.get(str(features.get('education')).lower(), 4)
#     features['farm_type'] = farm_type_map.get(str(features.get('farm_type')).lower(), 3)

#     # --- Calculate compliance_score ---

#     compliance_columns = [
#         'follow_prescription', 'check_expiry', 'increase_dosage', 'improvement_stop',
#         'misuse_amr', 'training_usage', 'consult_veterinan', 'amr_is_problem',
#         'regulations', 'withdraw', 'importance_withdraw'
#     ]

#     # Sum and normalize
#     compliance_sum = sum([features.get(col, 0) for col in compliance_columns])
#     compliance_score = (compliance_sum / len(compliance_columns)) * 100 if len(compliance_columns) > 0 else 0
#     features['compliance_score'] = compliance_score

#     # --- Calculate risk_score ---
#     # Define risk weights as per your earlier logic:

#     risk_factors = {}

#     # Merge all risk weights
#     risk_factors.update(disposal_columns_weights)
#     risk_factors.update(manure_columns_weights)
#     risk_factors.update(storage_columns_weights)

#     # Compute risk_score numerator
#     risk_score_num = 0
#     for col, weight in risk_factors.items():
#         val = features.get(col, 0)
#         risk_score_num += val * weight

#     max_possible_risk = sum(risk_factors.values())  # denominator for normalization
#     risk_score = (risk_score_num / max_possible_risk) * 100 if max_possible_risk > 0 else 0
#     features['risk_score'] = risk_score

#     # --- NOTE ---
#     # We cannot calculate 'high_risk' and 'non_compliant' flags here due to single-row data (need quantiles on dataset)
#     # So leave those columns out or add as 0 for compatibility
#     features['high_risk'] = 0
#     features['non_compliant'] = 0

#     # Ensure all expected columns present, fill missing with 0
#     if model_feature_columns is not None:
#         for col in model_feature_columns:
#             if col not in features:
#                 features[col] = 0

#     df = pd.DataFrame([features], columns=model_feature_columns)

#     return df



# def load_data_from_csv(
#     filepath='Dataset.csv',
#     model_feature_columns=None,
#     disease_chicken_list=None,
#     disease_pig_list=None,
#     antibiotics_list=None
# ):
#     if not os.path.exists(filepath):
#         raise FileNotFoundError(f"{filepath} not found. Please provide a valid dataset file.")
#     df = pd.read_csv(filepath)

#     list_cols = ['disease_chicken', 'disease_pig', 'antibiotics_used']
#     for col in list_cols:
#         if col in df.columns:
#             df[col] = df[col].apply(lambda x: eval(x) if isinstance(x, str) and x.startswith('[') else x)

#     return preprocess_input(df, model_feature_columns, disease_chicken_list, disease_pig_list, antibiotics_list)


# def load_data_from_json(
#     json_data,
#     model_feature_columns=None,
#     disease_chicken_list=None,
#     disease_pig_list=None,
#     antibiotics_list=None
# ):
#     if isinstance(json_data, dict):
#         df = pd.DataFrame([json_data])
#     else:
#         df = pd.DataFrame(json_data)

#     list_cols = ['disease_chicken', 'disease_pig', 'antibiotics_used']
#     for col in list_cols:
#         if col in df.columns:
#             def ensure_list(val):
#                 if isinstance(val, str):
#                     try:
#                         import ast
#                         parsed = ast.literal_eval(val)
#                         return parsed if isinstance(parsed, list) else []
#                     except:
#                         return []
#                 elif isinstance(val, list):
#                     return val
#                 else:
#                     return []
#             df[col] = df[col].apply(ensure_list)
 
#     return preprocess_input(df, model_feature_columns, disease_chicken_list, disease_pig_list, antibiotics_list)




# def train_amu_model(df):
#     feature_columns = ['gender', 'age', 'education', 'farm_type', 'years_farming', 'chicken_disease_count', 'pig_disease_count', 'antibiotic_variety']
#     feature_columns = [col for col in feature_columns if col in df.columns]
#     X = df[feature_columns].copy()
#     y = df['non_compliant']

#     # Encode categorical variables
#     for col in X.columns:
#         if X[col].dtype == 'object':
#             le = LabelEncoder()
#             X[col] = le.fit_transform(X[col].astype(str))

#     X = X.fillna(0)
#     X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
#     model = RandomForestClassifier(n_estimators=100, random_state=42)
#     model.fit(X_train, y_train)

#     y_pred = model.predict(X_test)
#     accuracy = accuracy_score(y_test, y_pred)

#     return model, feature_columns, accuracy

# def train_biosecurity_model(df):
#     feature_columns = ['gender', 'age', 'education', 'farm_type', 'years_farming', 'chicken_disease_count', 'pig_disease_count', 'antibiotic_variety']
#     manure_columns = ['manure_mngt_composting', 'manure_mngt_fields', 'manure_mngt_Storing', 'manure_mngt_landfill', 'store_lessweek', 'store_1-2 weeks', 'store_morethan2', 'store_dont_store']
#     for col in manure_columns:
#         if col in df.columns: feature_columns.append(col)

#     feature_columns = [col for col in feature_columns if col in df.columns]
#     X = df[feature_columns].copy()
#     y = df['high_risk']
#     for col in X.columns:
#         if X[col].dtype == 'object':
#             le = LabelEncoder()
#             X[col] = le.fit_transform(X[col].astype(str))

#     X = X.fillna(0)
#     X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
#     model = RandomForestClassifier(n_estimators=100, random_state=42)
#     model.fit(X_train, y_train)

#     y_pred = model.predict(X_test)
#     accuracy = accuracy_score(y_test, y_pred)

#     return model, feature_columns, accuracy


# def detect_anomalies(df):
#     numerical_features = ['compliance_score', 'risk_score', 'years_farming', 'chicken_disease_count', 'pig_disease_count', 'antibiotic_variety']
#     numerical_features = [col for col in numerical_features if col in df.columns]
#     X = df[numerical_features].copy()
#     X = X.fillna(0)

#     scaler = StandardScaler()
#     X_scaled = scaler.fit_transform(X)
#     iso_forest = IsolationForest(contamination=0.1, random_state=42)
#     anomalies = iso_forest.fit_predict(X_scaled)

#     df['anomaly'] = anomalies
#     df['anomaly'] = df['anomaly'].apply(lambda x: 1 if x == -1 else 0)

#     return df


# def predict_from_json(raw_json, amu_model, bio_model, disease_chicken_list=None, disease_pig_list=None, antibiotics_list=None):
#     # Prepare input row for AMU model
#     amu_features = amu_model.feature_names_in_ if hasattr(amu_model, 'feature_names_in_') else []
#     df_amu = preprocess_input(raw_json, amu_features, disease_chicken_list, disease_pig_list, antibiotics_list)
#     amu_pred = amu_model.predict(df_amu)[0]

#     # Prepare input row for Biosecurity model
#     bio_features = bio_model.feature_names_in_ if hasattr(bio_model, 'feature_names_in_') else []
#     df_bio = preprocess_input(raw_json, bio_features, disease_chicken_list, disease_pig_list, antibiotics_list)

#     bio_pred = bio_model.predict(df_bio)[0]
#     return {
#         'amu_predictions': [amu_pred],
#         'biosecurity_predictions': [bio_pred]
#     }




# def convert_np_int(obj):
#     if isinstance(obj, np.integer):
#     # if isinstance(obj, np.int64):
#         return int(obj)
#     raise TypeError


# def main():
#     # Load raw CSV as DataFrame
#     script_dir = os.path.dirname(os.path.abspath(__file__))
#     csv_path = os.path.join(script_dir, 'Dataset.csv')
#     df_raw = pd.read_csv(csv_path)

#     # Disease and antibiotic lists
#     disease_chicken_list = [1,2,3,4,5,6,7,8]
#     disease_pig_list = [1,2,3,4,5,6,7,8,9,10,11]
#     antibiotics_list = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22]

#     # Preprocess each row in df_raw into feature dataframe
#     # Because preprocess_input works on single JSON/dict, map row-wise
#     processed_rows = []
#     for _, row in df_raw.iterrows():
#         row_dict = row.to_dict()
#         processed_row = preprocess_input(row_dict, model_feature_columns=None, # temporarily None, fix later
#                                         disease_chicken_list=disease_chicken_list,
#                                         disease_pig_list=disease_pig_list,
#                                         antibiotics_list=antibiotics_list)
#         processed_rows.append(processed_row)

#     # Concatenate all processed rows
#     df_processed = pd.concat(processed_rows, ignore_index=True)

#     # Now, get columns to train your model
#     amu_model, amu_features, amu_acc = train_amu_model(df_processed)
#     bio_model, bio_features, bio_acc = train_biosecurity_model(df_processed)

#     # print(f"AMU Model accuracy: {amu_acc}")
#     # print(f"Biosecurity Model accuracy: {bio_acc}")

#     # Now use these lists for future inputs (i.e. for your sample_json)
#     # sample_json = {
#     #     "gender": "male",
#     #     "age": 35,
#     #     "education": "secondary",
#     #     "farm_type": "pigfarm",
#     #     "years_farming": 10,
#     #     "follow_prescription": 1,
#     #     "check_expiry": 0,
#     #     "increase_dosage": 0,
#     #     "improvement_stop": 1,
#     #     "misuse_amr": 0,
#     #     "training_usage": 1,
#     #     "consult_veterinan": 1,
#     #     "amr_is_problem": 0,
#     #     "regulations": 1,
#     #     "withdraw": 0,
#     #     "importance_withdraw": 1,
#     #     "e_dispose": "return",
#     #     "p_dispose": "incineration",
#     #     "manure_mngt": "composting",
#     #     "store": "1-2 weeks",
#     #     "disease_chicken": [1, 3],
#     #     "disease_pig": [2],
#     #     "antibiotics_used": [1, 5]
#     # }

#     input_json_str = sys.stdin.read()
#     input_data = json.loads(input_json_str)
#     # print(f"Received input: {input_data}")

#     preds = predict_from_json(input_data,
#                              amu_model=amu_model,
#                              bio_model=bio_model,
#                              disease_chicken_list=disease_chicken_list,
#                              disease_pig_list=disease_pig_list,
#                              antibiotics_list=antibiotics_list)
    
#     # Print the result as JSON string for JS to capture
#     # Use `default` parameter in json.dumps to handle numpy ints
#     print(json.dumps(preds, default=convert_np_int))
#     # print("Predictions for sample input:", preds)


# if __name__ == "__main__":
#     main()


import json
import sys
import pandas as pd
import numpy as np
import warnings
import os
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

def preprocess_input(raw_data, model_feature_columns=None, disease_chicken_list=None, disease_pig_list=None, antibiotics_list=None):
    """
    Preprocess input data for model prediction
    
    Parameters:
    raw_data: dict or DataFrame row with input data
    model_feature_columns: list of columns expected by the trained model
    disease_chicken_list: list of valid chicken disease IDs
    disease_pig_list: list of valid pig disease IDs
    antibiotics_list: list of valid antibiotic IDs
    
    Returns: single-row DataFrame with columns matching model_feature_columns
    """
    # Convert to dictionary if it's a DataFrame row
    if hasattr(raw_data, 'to_dict'):
        raw_json = raw_data.to_dict()
    else:
        raw_json = raw_data
    
    features = {}

    # Scalar fields with default fallback
    scalar_fields = [
        'gender', 'age', 'education', 'farm_type', 'years_farming',
        'follow_prescription', 'check_expiry', 'increase_dosage', 'improvement_stop',
        'misuse_amr', 'training_usage', 'consult_veterinan', 'amr_is_problem',
        'regulations', 'withdraw', 'importance_withdraw'
    ]

    for f in scalar_fields:
        if f in ['gender', 'education', 'farm_type']:
            features[f] = raw_json.get(f, 'Unknown')
        else:
            # Try to convert to int, fallback to 0
            val = raw_json.get(f, 0)
            try:
                features[f] = int(val)
            except (ValueError, TypeError):
                features[f] = 0

    # One-hot encode disposal fields
    e_dispose_options = ['return', 'incineration', 'waste', 'field']
    p_dispose_options = ['return', 'incineration', 'waste', 'field']
    manure_options = ['composting', 'fields', 'storing', 'landfill']
    store_options = ['lessthan1week', '1-2weeks', 'morethan2weeks', 'dontstore']

    # e_dispose
    e_dispose_val = str(raw_json.get('e_dispose', '')).lower()
    for val in e_dispose_options:
        col = f"e_dispose_{val}"
        features[col] = 1 if e_dispose_val == val else 0

    # p_dispose
    p_dispose_val = str(raw_json.get('p_dispose', '')).lower()
    for val in p_dispose_options:
        col = f"p_dispose_{val}"
        features[col] = 1 if p_dispose_val == val else 0

    # manure_mngt
    manure_val = str(raw_json.get('manure_mngt', '')).lower()
    for val in manure_options:
        col = f"manure_mngt_{val}"
        features[col] = 1 if manure_val == val else 0

    # store
    store_val = str(raw_json.get('store', '')).lower().replace(' ', '')
    for val in store_options:
        col = f"store_{val}"
        features[col] = 1 if store_val == val else 0

    # Diseases and Antibiotics one-hot encoding
    chicken_disease_ids = raw_json.get('disease_chicken', [])
    if not isinstance(chicken_disease_ids, list):
        try:
            chicken_disease_ids = eval(chicken_disease_ids) if isinstance(chicken_disease_ids, str) else []
        except:
            chicken_disease_ids = []

    pig_disease_ids = raw_json.get('disease_pig', [])
    if not isinstance(pig_disease_ids, list):
        try:
            pig_disease_ids = eval(pig_disease_ids) if isinstance(pig_disease_ids, str) else []
        except:
            pig_disease_ids = []

    antibiotics_used_ids = raw_json.get('antibiotics_used', [])
    if not isinstance(antibiotics_used_ids, list):
        try:
            antibiotics_used_ids = eval(antibiotics_used_ids) if isinstance(antibiotics_used_ids, str) else []
        except:
            antibiotics_used_ids = []

    for disease_id in (disease_chicken_list or []):
        col = f'disease_chicken_{disease_id}'
        features[col] = 1 if disease_id in chicken_disease_ids else 0

    for disease_id in (disease_pig_list or []):
        col = f'disease_pig_{disease_id}'
        features[col] = 1 if disease_id in pig_disease_ids else 0

    for antibiotic_id in (antibiotics_list or []):
        col = f'used_{antibiotic_id}'
        features[col] = 1 if antibiotic_id in antibiotics_used_ids else 0

    features['disease_chicken_count'] = len(chicken_disease_ids)
    features['disease_pig_count'] = len(pig_disease_ids)
    features['antibiotic_variety'] = len(antibiotics_used_ids)

    # Encode categorical variables
    features['gender'] = gender_map.get(str(features.get('gender', 'unknown')).lower(), 2)
    features['education'] = education_map.get(str(features.get('education', 'unknown')).lower(), 4)
    features['farm_type'] = farm_type_map.get(str(features.get('farm_type', 'unknown')).lower(), 3)

    # --- Calculate compliance_score ---
    # These questions should be on a Likert scale (1-5), not binary (0/1)
    compliance_columns = [
        'follow_prescription', 'check_expiry', 'increase_dosage', 'improvement_stop',
        'misuse_amr', 'training_usage', 'consult_veterinan', 'amr_is_problem',
        'regulations', 'withdraw', 'importance_withdraw'
    ]

    # Sum and normalize (assuming Likert scale 1-5)
    compliance_sum = sum([features.get(col, 0) for col in compliance_columns])
    max_possible_compliance = len(compliance_columns) * 5  # 5 is the maximum score per question
    compliance_score = (compliance_sum / max_possible_compliance) * 100 if max_possible_compliance > 0 else 0
    features['compliance_score'] = compliance_score

    # --- Calculate risk_score ---
    risk_factors = {}
    risk_factors.update(disposal_columns_weights)
    risk_factors.update(manure_columns_weights)
    risk_factors.update(storage_columns_weights)

    # Compute risk_score numerator
    risk_score_num = 0
    for col, weight in risk_factors.items():
        val = features.get(col, 0)
        risk_score_num += val * weight

    max_possible_risk = sum(risk_factors.values())  # denominator for normalization
    risk_score = (risk_score_num / max_possible_risk) * 100 if max_possible_risk > 0 else 0
    features['risk_score'] = risk_score

    # For single prediction, we can't calculate percentiles, so we'll use fixed thresholds
    # These should be calibrated based on your training data
    features['high_risk'] = 1 if risk_score > 60 else 0
    features['non_compliant'] = 1 if compliance_score < 70 else 0

    # Ensure all expected columns present, fill missing with 0
    if model_feature_columns is not None:
        for col in model_feature_columns:
            if col not in features:
                features[col] = 0

    # Create DataFrame with proper column ordering
    if model_feature_columns:
        df = pd.DataFrame([features], columns=model_feature_columns)
    else:
        df = pd.DataFrame([features])
    
    return df

def load_data_from_csv(
    filepath='Dataset.csv',
    model_feature_columns=None,
    disease_chicken_list=None,
    disease_pig_list=None,
    antibiotics_list=None
):
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"{filepath} not found. Please provide a valid dataset file.")
    
    df = pd.read_csv(filepath)
    processed_rows = []
    
    for _, row in df.iterrows():
        processed_row = preprocess_input(
            row, 
            model_feature_columns, 
            disease_chicken_list, 
            disease_pig_list, 
            antibiotics_list
        )
        processed_rows.append(processed_row)
    
    return pd.concat(processed_rows, ignore_index=True)

def train_amu_model(df):
    feature_columns = [
        'gender', 'age', 'education', 'farm_type', 'years_farming', 
        'disease_chicken_count', 'disease_pig_count', 'antibiotic_variety',
        'compliance_score', 'risk_score'
    ]
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

def train_biosecurity_model(df):
    feature_columns = [
        'gender', 'age', 'education', 'farm_type', 'years_farming', 
        'disease_chicken_count', 'disease_pig_count', 'antibiotic_variety',
        'compliance_score', 'risk_score'
    ]
    
    manure_columns = [
        'manure_mngt_composting', 'manure_mngt_fields', 
        'manure_mngt_storing', 'manure_mngt_landfill'
    ]
    
    storage_columns = [
        'store_lessthan1week', 'store_1-2weeks', 
        'store_morethan2weeks', 'store_dontstore'
    ]
    
    for col in manure_columns + storage_columns:
        if col in df.columns: 
            feature_columns.append(col)

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

def predict_from_json(raw_json, amu_model, bio_model, disease_chicken_list=None, disease_pig_list=None, antibiotics_list=None):
    # Prepare input row for both models
    amu_features = amu_model.feature_names_in_ if hasattr(amu_model, 'feature_names_in_') else []
    bio_features = bio_model.feature_names_in_ if hasattr(bio_model, 'feature_names_in_') else []
    
    # Get all possible features
    all_features = list(set(list(amu_features) + list(bio_features)))

    
    # Preprocess input
    df_processed = preprocess_input(
        raw_json, 
        all_features, 
        disease_chicken_list, 
        disease_pig_list, 
        antibiotics_list
    )
    
    # Extract scores for returning
    compliance_score = df_processed['compliance_score'].iloc[0]
    risk_score = df_processed['risk_score'].iloc[0]
    
    # Prepare data for each model
    df_amu = df_processed[list(amu_features)] if len(amu_features)>0 else df_processed
    df_bio = df_processed[list(bio_features)] if len(bio_features)>0 else df_processed
    
    # Make predictions
    amu_pred = amu_model.predict(df_amu)[0]
    bio_pred = bio_model.predict(df_bio)[0]
    
    return {
        'amu_predictions': int(amu_pred),
        'biosecurity_predictions': int(bio_pred),
        'compliance_score': float(compliance_score),
        'risk_score': float(risk_score)
    }

def convert_np_int(obj):
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    raise TypeError

def main():
    # Load raw CSV as DataFrame
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(script_dir, 'Dataset.csv')
    
    # Disease and antibiotic lists
    disease_chicken_list = [1, 2, 3, 4, 5, 6, 7, 8]
    disease_pig_list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    antibiotics_list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]

    # Load and preprocess data
    df_processed = load_data_from_csv(
        csv_path, 
        None, 
        disease_chicken_list, 
        disease_pig_list, 
        antibiotics_list
    )
    
    # Calculate high_risk and non_compliant based on percentiles
    df_processed['high_risk'] = (df_processed['risk_score'] > df_processed['risk_score'].quantile(0.75)).astype(int)
    df_processed['non_compliant'] = (df_processed['compliance_score'] < df_processed['compliance_score'].quantile(0.25)).astype(int)

    # Train models
    amu_model, amu_features, amu_acc = train_amu_model(df_processed)
    bio_model, bio_features, bio_acc = train_biosecurity_model(df_processed)

    # Read input from stdin
    input_json_str = sys.stdin.read()
    input_data = json.loads(input_json_str)

    # Make prediction
    preds = predict_from_json(
        input_data,
        amu_model=amu_model,
        bio_model=bio_model,
        disease_chicken_list=disease_chicken_list,
        disease_pig_list=disease_pig_list,
        antibiotics_list=antibiotics_list
    )
    
    # Print the result as JSON string for JS to capture
    print(json.dumps(preds, default=convert_np_int))

if __name__ == "__main__":
    main()