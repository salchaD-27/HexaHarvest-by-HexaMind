import json
import pickle
import sys
import numpy as np
import os

# Load models and encoder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model_path = os.path.join(BASE_DIR, "yield_prediction", "DecisionTreeRegression.pkl")
DTR = pickle.load(open(model_path, "rb"))

# model_path = os.path.join(BASE_DIR, "yield_prediction", "RandomForestRegression.pkl")
# RFR = pickle.load(open(model_path, "rb"))

model_path = os.path.join(BASE_DIR, "yield_prediction", "XGBosstRegression.pkl")
XGBR = pickle.load(open(model_path, "rb"))

model_path = os.path.join(BASE_DIR, "yield_prediction", "OHEncoder.pkl")
ct = pickle.load(open(model_path, "rb"))


# trained colums
seasons=['Autumn', 'Kharif', 'Rabi', 'Summer', 'Winter', 'Whole Year']
seasons=['Autumn     ', 'Kharif     ', 'Rabi       ', 'Summer     ', 'Whole Year ', 'Winter     ']
states=['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Sikkim',
 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
 'West Bengal']

seasonsMap={
    'Autumn':'Autumn     ', 
    'Kharif': 'Kharif     ',
    'Rabi': 'Rabi       ',
    'Summer': 'Summer     ',
    'Winter': 'Winter     ',
    'Whole Year':'Whole Year '
}

def predict_yield_prediction(data, model="xgb"):
    try:
        features = [[
            data["Crop"],
            seasonsMap.get(data["Season"], data["Season"]),
            data["State"],
            data["Area"],
            data["Production"],
            data["Annual_Rainfall"],
            data["Fertilizer"],
            data["Pesticide"]
        ]]

        features_transformed = ct.transform(features)

        if model == "xgb":
            prediction = XGBR.predict(features_transformed)[0]
        # elif model == "rfr":
            # prediction = RFR.predict(features_transformed)[0]
        elif model == "dtr":
            prediction = DTR.predict(features_transformed)[0]
        else:
            raise ValueError("Invalid model choice: use 'xgb' or 'rfr' or 'dtr'")

        return prediction

    except KeyError as e:
        raise ValueError(f"Missing required field: {e}")
    except Exception as e:
        raise e


if __name__ == "__main__":
    input_str = sys.stdin.read()
    yield_data = json.loads(input_str)

    try:
        # yield_pred_dtr = predict_yield_prediction(yield_data, model="dtr")
        # yield_pred_rfr = predict_yield_prediction(yield_data, model="rfr")
        yield_pred_xgb = predict_yield_prediction(yield_data, model="xgb")

            # "DecisionTreeRegression": yield_pred_dtr,
            # "RandomForestRegression": yield_pred_rfr,
            # "XGBoostRegression": yield_pred_xgb,
        result = {"Prediction": yield_pred_xgb}

    except Exception as e:
        result = {"error": str(e)}

    # To ensure JSON serializability of numpy types
    def make_serializable(obj):
        import numpy as np
        if isinstance(obj, np.generic):
            return obj.item()
        raise TypeError(f"Type {type(obj)} not serializable")

    print(json.dumps(result, default=make_serializable))
