import os
import csv
import time
import json
import requests
from statistics import mean

# Resolve paths relative to the script's location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
API_URL = "http://localhost:8000/chat"
CLEAR_URL = "http://localhost:8000/clear-history"
INPUT_CSV = os.path.join(BASE_DIR, "chatbot_eval_cases.csv")
OUTPUT_CSV = os.path.join(BASE_DIR, "chatbot_eval_results.csv")

TIMEOUT = 60

def norm(s):
    return (s or "").strip().lower()

def contains_expected(reply, expected):
    expected = norm(expected)
    if expected == "":
        return 1
    return 1 if expected in norm(reply) else 0

def map_intent(raw_intent, reply_text):
    i = norm(raw_intent)
    r = norm(reply_text)
    
    # If the API already returned a valid intent, use it
    if i in {"list_cars", "car_detail", "inventory", "showroom_info", "appraisal", "rolling_price", "loan", "faq"}:
        return i
        
    # Fallback to string matching if intent is missing or unknown
    if "lăn bánh" in r or "tổng chi phí" in r or "giá lăn bánh" in r:
        return "rolling_price"
    if "trả góp" in r or "lãi suất" in r or "thời hạn vay" in r or "miễn phí thuế" in r:
        return "loan"
    if "chỉ tư vấn về xe" in r or "không thể giúp" in r:
        return "none"
    
    return "faq"

def score_intent(expected, actual):
    return 1 if norm(expected) == norm(actual) else 0

def score_cards(expected_min, cards_count):
    try:
        expected_min = int(expected_min)
    except:
        expected_min = 0
    return 1 if cards_count >= expected_min else 0

def run():
    rows = []
    with open(INPUT_CSV, "r", encoding="utf-8-sig") as f:
        rows = [r for r in csv.DictReader(f) if r.get("case_id")]

    last_non_none_intent = {}

    out_rows = []
    latencies = []
    intent_scores, answer_scores, cards_scores, context_scores = [], [], [], []

    for row in rows:
        case_id = row["case_id"]
        session_id = row["session_id"]
        message = row["user_message"]
        expected_intent = row["expected_intent"]
        expected_must_have = row["expected_must_have"]
        expected_cards_min = row["expected_cards_min"]
        is_multiturn = row["is_multiturn"] == "1"
        turn = int(row["turn"])

        # Clear history for first turn
        if turn == 1:
            try:
                requests.post(CLEAR_URL, json={"session_id": session_id}, timeout=5)
            except:
                pass

        payload = {"message": message, "session_id": session_id}

        t0 = time.time()
        try:
            resp = requests.post(API_URL, json=payload, timeout=TIMEOUT)
            latency_ms = int((time.time() - t0) * 1000)
            latencies.append(latency_ms)

            data = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {}
            reply = data.get("reply", "")
            raw_intent = data.get("intent")
            cards = data.get("cards", []) if isinstance(data.get("cards", []), list) else []
            cards_count = len(cards)

            actual_intent = map_intent(raw_intent, reply)

            s_intent = score_intent(expected_intent, actual_intent)
            s_answer = contains_expected(reply, expected_must_have)
            s_cards = score_cards(expected_cards_min, cards_count)

            if is_multiturn and turn > 1:
                # Check if we have context from previous turn in this session
                s_context = 1 if session_id in last_non_none_intent else 0
            else:
                s_context = ""

            if actual_intent not in {"none"}:
                last_non_none_intent[session_id] = actual_intent

            if s_context != "":
                total = (s_intent + s_answer + s_cards + s_context) / 4
                context_scores.append(s_context)
            else:
                total = (s_intent + s_answer + s_cards) / 3

            intent_scores.append(s_intent)
            answer_scores.append(s_answer)
            cards_scores.append(s_cards)

            out_rows.append({
                **row,
                "status_code": resp.status_code,
                "latency_ms": latency_ms,
                "actual_intent": actual_intent,
                "actual_reply": reply,
                "actual_cards_count": cards_count,
                "intent_score": s_intent,
                "answer_score": s_answer,
                "cards_score": s_cards,
                "context_score": s_context,
                "total_score": round(total, 3),
                "error": ""
            })

            print(f"[OK] {case_id} - {latency_ms}ms - intent={actual_intent}")

        except Exception as e:
            latency_ms = int((time.time() - t0) * 1000)
            out_rows.append({
                **row,
                "status_code": "",
                "latency_ms": latency_ms,
                "actual_intent": "",
                "actual_reply": "",
                "actual_cards_count": 0,
                "intent_score": 0,
                "answer_score": 0,
                "cards_score": 0,
                "context_score": "",
                "total_score": 0,
                "error": str(e)
            })
            intent_scores.append(0)
            answer_scores.append(0)
            cards_scores.append(0)
            print(f"[ERR] {case_id} - {e}")

    if not out_rows:
        print("No cases to process.")
        return

    fieldnames = list(out_rows[0].keys())
    with open(OUTPUT_CSV, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(out_rows)

    summary = {
        "total_cases": len(out_rows),
        "intent_accuracy": round(sum(intent_scores) / len(intent_scores), 4) if intent_scores else 0,
        "answer_correctness": round(sum(answer_scores) / len(answer_scores), 4) if answer_scores else 0,
        "card_relevance_rate": round(sum(cards_scores) / len(cards_scores), 4) if cards_scores else 0,
        "context_carryover_accuracy": round(sum(context_scores) / len(context_scores), 4) if context_scores else 0,
        "avg_latency_ms": round(mean(latencies), 2) if latencies else 0,
    }

    print("\n=== SUMMARY ===")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    print(f"\nSaved: {OUTPUT_CSV}")

if __name__ == "__main__":
    run()