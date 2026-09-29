# Drishti ML & Vision Service Foundation

## Role in Architecture
This directory contains the Python foundation for Drishti's planned ML microservices:
1. **Deep PII & NER Detection**: Microsoft Presidio / custom regex & transformer models for complex text entity detection.
2. **Local OCR Engine**: EasyOCR / Tesseract to extract text coordinates from raw screenshots for visual bounding box alignment.
3. **Vision-Language Model (VLM) Bridge**: Local or remote vision model inference endpoint consuming sanitized frames.

## Security Boundary
The Python ML service operates under the strict Drishti Privacy Protocol:
- **Vision Models**: Must only receive the sanitized visual frame (pixels of sensitive regions masked).
- **OCR/PII Service**: When OCR is used to detect sensitive regions, it is considered an internal sub-component of the `PrivacyGuard`. Raw OCR tokens containing sensitive data are redacted locally before any visual state leaves the privacy perimeter.
