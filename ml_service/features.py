import pandas as pd
import numpy as np

def generate_mock_data(n_samples=1000):
    np.random.seed(42)
    data = {
        'quiz_score': np.random.uniform(0, 100, n_samples),
        'coding_accuracy': np.random.uniform(0, 100, n_samples),
        'time_per_question': np.random.uniform(10, 300, n_samples),
        'retry_attempts': np.random.randint(1, 10, n_samples),
        'wrong_answer_ratio': np.random.uniform(0, 1, n_samples),
        'difficulty_level': np.random.randint(1, 5, n_samples),
        'unit_performance_trend': np.random.uniform(-1, 1, n_samples)
    }
    df = pd.DataFrame(data)
    # Define weak probability target
    df['gap_probability'] = np.clip(
        0.4 * (100 - df['coding_accuracy']) / 100 +
        0.3 * df['wrong_answer_ratio'] +
        0.2 * df['retry_attempts'] / 10 +
        0.1 * (1 - df['unit_performance_trend']),
        0, 1
    )
    # Binary classification target for modeling logic
    df['has_gap'] = (df['gap_probability'] > 0.5).astype(int)
    return df

def preprocess_features(df):
    features = ['quiz_score', 'coding_accuracy', 'time_per_question', 
                'retry_attempts', 'wrong_answer_ratio', 'difficulty_level', 
                'unit_performance_trend']
    return df[features]
