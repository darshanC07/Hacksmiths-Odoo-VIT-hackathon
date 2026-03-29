from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional
import uvicorn
from ocr_engine import process_receipt_image

app = FastAPI()

# Response structure based on the Problem Statement 
class OCRResponse(BaseModel):
    amount: float
    date: str
    vendor: str
    description: str

@app.post("/scan", response_model=OCRResponse)
async def scan_receipt(file: UploadFile = File(...)):
    """
    Endpoint for employees to scan receipts and auto-generate expense claims[cite: 17, 54].
    """
    # Validate that the uploaded file is an image
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a receipt image.")

    try:
        image_bytes = await file.read()
        
        # Call the OCR logic
        data = process_receipt_image(image_bytes)
        
        if not data:
            raise HTTPException(status_code=422, detail="OCR could not detect any text in the image.")

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)