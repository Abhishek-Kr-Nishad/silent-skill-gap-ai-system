import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
import xgboost as xgb
from features import generate_mock_data, preprocess_features

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

def train_models():
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)

    df = generate_mock_data(2000)
    X = preprocess_features(df)
    y = df['has_gap']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 1. Baseline Model
    print("Training Logistic Regression...")
    lr_model = LogisticRegression(max_iter=1000)
    lr_model.fit(X_train, y_train)
    joblib.dump(lr_model, os.path.join(MODEL_DIR, 'logistic_regression.joblib'))

    # 2. Random Forest
    print("Training Random Forest...")
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)
    joblib.dump(rf_model, os.path.join(MODEL_DIR, 'random_forest.joblib'))

    # 3. XGBoost (Primary Model)
    print("Training XGBoost...")
    xgb_model = xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)
    xgb_model.fit(X_train, y_train)
    joblib.dump(xgb_model, os.path.join(MODEL_DIR, 'xgboost.joblib'))

    print("All models trained and saved to", MODEL_DIR)

if __name__ == "__main__":
    train_models()
