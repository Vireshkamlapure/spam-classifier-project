import joblib
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# 1. Initialize the FastAPI app
app = FastAPI()

# 2. Add CORS middleware
# This allows your frontend (running on a different URL) to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (for simplicity)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# 3. Load your saved model pipeline
model = joblib.load('model.pkl')

# 4. Define the request body format
# This tells FastAPI what kind of data to expect
class Message(BaseModel):
    text: str

# 5. Create a root endpoint
@app.get("/")
def read_root():
    return {"message": "SpamGuard API is running!"}

# 6. Create the prediction endpoint
@app.post("/predict")
def predict_spam(message: Message):
    # The model expects a list of texts, so we pass [message.text]
    prediction = model.predict([message.text])

    # Get the prediction label (e.g., 'spam' or 'ham')
    label = prediction[0]

    # Return the prediction as a JSON response
    return {"prediction": label}