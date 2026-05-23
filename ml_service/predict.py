import os
import joblib
import pandas as pd
import shap

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
xgb_path = os.path.join(MODEL_DIR, 'xgboost.joblib')

xgb_model = None

def load_model():
    global xgb_model
    if xgb_model is None and os.path.exists(xgb_path):
        xgb_model = joblib.load(xgb_path)
    return xgb_model

def get_predictions_and_explanations(student_data: dict):
    model = load_model()
    if not model:
        raise Exception("Model not found. Please train models first.")
        
    df = pd.DataFrame([student_data])
    
    probability = model.predict_proba(df)[0][1] # Probability of having a gap
    confidence = abs(probability - 0.5) * 2 # simple confidence heuristic
    
    # SHAP explainer
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(df)
    
    # Analyze the largest features contributing to the gap
    feature_impacts = {feature: abs(impact) for feature, impact in zip(df.columns, shap_values[0])}
    weak_topic_heuristic = max(feature_impacts, key=feature_impacts.get)
    
    recommendation = f"Focus on improving metrics related to {weak_topic_heuristic.replace('_', ' ')}."
    
    return {
        'gap_probability': float(probability * 100),
        'confidence_score': float(confidence * 100),
        'weak_topic_detection': weak_topic_heuristic,
        'recommendations': recommendation
    }
