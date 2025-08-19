from fastapi import FastAPI
from pydantic import BaseModel
from models.life_expectancy import predict_life_expectancy


# Define input schema
class LifeExpectancyInput(BaseModel):
    Height: float
    Weight: float
    Gender: str
    BMI: float
    Physical_Activity: str
    Smoking_Status: str
    Alcohol_Consumption: str
    Diet: str
    Blood_Pressure: str
    Cholesterol: float
    Asthma: int
    Diabetes: int
    Heart_Disease: int
    Hypertension: int


# Initialize FastAPI
app = FastAPI(title="Life Expectancy Prediction API")


@app.post("/life-expectancy")
def get_life_expectancy(data: LifeExpectancyInput):
    """
    Takes health & lifestyle inputs and returns predicted life expectancy.
    """
    # Convert to DataFrame for model input
    user_data = data.model_dump()

    # Make prediction
    prediction = predict_life_expectancy(user_data)

    return {"predicted_life_expectancy": round(float(prediction), 2)}
