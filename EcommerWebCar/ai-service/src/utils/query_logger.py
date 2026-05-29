import os
import csv
import logging
import threading
from datetime import datetime

# Thread safety lock
_log_lock = threading.Lock()

# Log directories and file paths
LOGS_DIR = "logs"
CSV_FILE = os.path.join(LOGS_DIR, "customer_queries.csv")
LOG_FILE = os.path.join(LOGS_DIR, "customer_queries.log")

# Create logs directory if it doesn't exist
if not os.path.exists(LOGS_DIR):
    os.makedirs(LOGS_DIR)

# Initialize standard python logger for customer queries
_query_logger = logging.getLogger("CUSTOMER_QUERIES")
_query_logger.setLevel(logging.INFO)

# Avoid duplicate handlers if imported/initialized multiple times
if not _query_logger.handlers:
    # Use standard FileHandler with utf-8 encoding
    _fh = logging.FileHandler(LOG_FILE, encoding="utf-8")
    _formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
    _fh.setFormatter(_formatter)
    _query_logger.addHandler(_fh)
    _query_logger.propagate = False


def init_csv_file():
    """Initializes the CSV log file with headers if it does not exist."""
    headers = ["Timestamp", "Session ID", "Query", "Intent", "Sentiment", "Is Off-Topic"]
    with _log_lock:
        if not os.path.exists(CSV_FILE):
            try:
                with open(CSV_FILE, mode="w", newline="", encoding="utf-8") as f:
                    writer = csv.writer(f)
                    writer.writerow(headers)
            except Exception as e:
                # Fallback logging if CSV creation fails
                _query_logger.error(f"Failed to initialize CSV headers: {e}")


def log_customer_query(
    session_id: str,
    query: str,
    intent: str,
    sentiment: str,
    is_off_topic: bool
):
    """
    Thread-safely writes a customer query record to both the CSV file and the standard log file.
    
    Args:
        session_id (str): ID of the chat session.
        query (str): The raw text message entered by the customer.
        intent (str): The detected intent or categorized topic.
        sentiment (str): Sentiment classification (e.g., POSITIVE, NEGATIVE, NEUTRAL).
        is_off_topic (bool): Flag indicating if the query was blocked as off-topic.
    """
    # Clean the query string to remove unnecessary newlines or trailing whitespaces for clean logs
    clean_query = " ".join(query.strip().split())
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # 1. Log to standard developer text log file
    log_msg = (
        f"Session: {session_id} | Query: '{clean_query}' | "
        f"Intent: {intent} | Sentiment: {sentiment} | Off-Topic: {is_off_topic}"
    )
    _query_logger.info(log_msg)
    
    # 2. Write to CSV file for easy business/spreadsheet compilation
    # Ensure CSV is initialized
    if not os.path.exists(CSV_FILE):
        init_csv_file()
        
    with _log_lock:
        try:
            with open(CSV_FILE, mode="a", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow([
                    timestamp,
                    session_id,
                    clean_query,
                    intent or "N/A",
                    sentiment or "NEUTRAL",
                    "TRUE" if is_off_topic else "FALSE"
                ])
        except Exception as e:
            _query_logger.error(f"Failed to write query record to CSV: {e}")


# Proactively initialize CSV file on module import
init_csv_file()
