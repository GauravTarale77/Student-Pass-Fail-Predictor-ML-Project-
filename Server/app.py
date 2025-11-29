from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app) 

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
model = joblib.load(MODEL_PATH)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        if data is None:
            return jsonify({"error": "Invalid or missing JSON"}), 400


        if "study_hours" not in data or "previous_score" not in data:
            return jsonify({"error": "Missing 'study_hours' or 'previous_score'"}), 400

        study_hours = float(data["study_hours"])
        previous_score = float(data["previous_score"])

        features = np.array([[study_hours, previous_score]])

        pred_proba = model.predict_proba(features)[0]  
        pred_class = int(model.predict(features)[0]) 

        label = "Pass" if pred_class == 1 else "Fail"
        confidence = float(round(pred_proba[pred_class], 4))

        result_text = f"{label} ({confidence * 100:.2f}%)"

        return jsonify({
            "prediction": label,
            "class": pred_class,
            "confidence": confidence,
            "resultText": result_text
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
