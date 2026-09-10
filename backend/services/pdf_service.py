import io
import re
import logging
from typing import Tuple
try:
    from pypdf import PdfReader
except ImportError:
    try:
        from PyPDF2 import PdfReader
    except ImportError:
        PdfReader = None

logger = logging.getLogger("skillbank.pdf")

def extract_text_from_pdf(file_bytes: bytes, max_characters: int = 15000) -> Tuple[str, int]:
    """
    Extracts text from uploaded PDF bytes using pypdf.
    Returns a tuple of (cleaned_text, total_character_count).
    """
    try:
        stream = io.BytesIO(file_bytes)
        reader = PdfReader(stream)
        num_pages = len(reader.pages)
        logger.info(f"Extracting text from PDF with {num_pages} pages...")

        extracted_text_chunks = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                extracted_text_chunks.append(page_text)

        full_text = "\n".join(extracted_text_chunks)
        
        # Clean extra whitespace
        full_text = re.sub(r'[ \t]+', ' ', full_text)
        full_text = re.sub(r'\n{3,}', '\n\n', full_text).strip()

        # Truncate safely if document is very large to avoid hitting LLM context limits
        if len(full_text) > max_characters:
            logger.info(f"Truncating text from {len(full_text)} to {max_characters} characters for AI prompt.")
            full_text = full_text[:max_characters]

        return full_text, len(full_text)
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise ValueError(f"Failed to parse PDF document: {str(e)}")
