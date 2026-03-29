import easyocr
import cv2
import numpy as np
import re
from flask import jsonify

# Initialize Reader
reader = easyocr.Reader(['en'])

def process_receipt_image(image_bytes):
    """Core OCR algorithm to extract necessary fields for reimbursement."""
    # Convert bytes to OpenCV image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Grayscale helps EasyOCR handle mobile shadows
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Run OCR 
    results = reader.readtext(gray)
    
    if not results:
        return None

    # Extraction Logic
    full_text = " ".join([res[1] for res in results])
    
    # Amount Extraction
    amounts = re.findall(r'\d+(?:[.,]\d{2})', full_text)
    clean_amounts = [float(a.replace(',', '')) for a in amounts]
    total = max(clean_amounts) if clean_amounts else 0.0

    # Date Extraction
    date_match = re.search(r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b', full_text)
    date_val = date_match.group(0) if date_match else "Not Found"

    # Vendor Detection (Skipping headers like 'Expected Value')
    ignore_patterns = [r'expected', r'value', r'example', r'field', r'vendor', r'name']
    vendor_name = "Unknown Vendor"
    for res in results:
        text = res[1].strip()
        if not any(re.search(p, text.lower()) for p in ignore_patterns) and len(text) > 2:
            vendor_name = text
            break

    return {
        "amount": total,
        "date": date_val,
        "vendor": vendor_name,
        "description": f"Auto-generated expense from {vendor_name}"
    }

    # return {
    #     "raw_results": [res[1] for res in results] 
    # }
    # want full response use this 