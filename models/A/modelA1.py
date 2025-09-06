import json
import pickle
import sys
import numpy as np
import os

# Load models and label encoder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "crop_classifier", "XGBoostClassifier.pkl")
XGBC = pickle.load(open(model_path, "rb"))

model_path = os.path.join(BASE_DIR, "crop_classifier", "RandomForestClassifier.pkl")
RFC = pickle.load(open(model_path, "rb"))

model_path = os.path.join(BASE_DIR, "crop_classifier", "LabelEncoder.pkl")
le = pickle.load(open(model_path, "rb"))

crops = ['apple', 'banana', 'blackgram', 'chickpea', 'coconut', 'coffee', 'cotton',
         'grapes', 'jute', 'kidneybeans', 'lentil', 'maize', 'mango', 'mothbeans',
         'mungbean', 'muskmelon', 'orange', 'papaya', 'pigeonpeas', 'pomegranate', 'rice', 'watermelon']

def predict_soil_classification(data, model="xgb"):
    try:
        features = np.array([[
            float(data["Nitrogen"]),
            float(data["Phosphorus"]),
            float(data["Potassium"]),
            float(data["temprature"]),
            float(data["humidity"]),
            float(data["ph"]),
            float(data["rainfall"])
        ]])

        if model == "xgb":
            encoded_prediction = XGBC.predict(features)[0]
        elif model == "rfc":
            encoded_prediction = RFC.predict(features)[0]
        else:
            raise ValueError("Invalid model choice: use 'xgb' or 'rfc'")

        prediction = le.inverse_transform([encoded_prediction])[0]
        return crops[prediction]

    except KeyError as e:
        raise ValueError(f"Missing required field: {e}")
    except Exception as e:
        raise e


if __name__ == "__main__":
    input_str = sys.stdin.read()
    soil_data = json.loads(input_str)

    try:
        soil_pred_xgb = predict_soil_classification(soil_data, model="xgb")
        # soil_pred_rfc = predict_soil_classification(soil_data, model="rfc")

        result = {"Prediction": soil_pred_xgb}
            # "RandomForest": soil_pred_rfc

    except Exception as e:
        result = {"error": str(e)}

    print(json.dumps(result))
