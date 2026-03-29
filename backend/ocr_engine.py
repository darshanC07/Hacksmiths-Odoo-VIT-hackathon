import easyocr
import cv2
import numpy as np
import re

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

    # Combine all detected text for regex searching
    full_text = " ".join([res[1] for res in results])
    
    # Finds decimal numbers (e.g., 450.00 or 1,200.50)
    amounts = re.findall(r'\d+(?:[.,]\d{2})', full_text)
    clean_amounts = [float(a.replace(',', '')) for a in amounts]
    
    # Usually, the largest number on a receipt is the Total Amount
    total = max(clean_amounts) if clean_amounts else 0.0

    # Supports DD/MM/YYYY, MM-DD-YYYY, etc.
    date_match = re.search(r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b', full_text)
    date_val = date_match.group(0) if date_match else "Not Found"

    # patterns to ignore table headers text
    ignore_patterns = [r'expected', r'value', r'example', r'field', r'vendor', r'name', r'details', r'test']
    
    vendor_name = "Unknown Vendor"
    for res in results:
        original_text = res[1].strip()
        text_to_check = original_text.lower()
        
        if len(text_to_check) < 3:
            continue
            
        # If the text contains any 'ignore' words, skip to the next result
        is_forbidden = any(re.search(pattern, text_to_check) for pattern in ignore_patterns)
        
        if not is_forbidden:
            vendor_name = original_text
            break

    return {
        "amount": total,
        "date": date_val,
        "vendor": vendor_name,
        "description": f"Auto-generated expense from {vendor_name}"
    }