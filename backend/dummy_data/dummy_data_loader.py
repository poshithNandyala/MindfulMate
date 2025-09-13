from pymongo import MongoClient
import json
import os
from dotenv import load_dotenv


def get_mongo_collection(collection_name):
    load_dotenv()
    MONGO_URI = os.getenv("MONGO_URI")
    if not MONGO_URI:
        raise ValueError("MONGO_URI not found in environment variables")
    
    client = MongoClient(MONGO_URI)
    db = client["chatbot_db"]
    collection = db[collection_name]

    return collection

collection = get_mongo_collection("summary")
file_path = "journal_summary_dummy_data.json"

with open(file_path, "r", encoding="utf-8") as file:
    journal_data = json.load(file)

# Process journal data
for journal_entry in journal_data:
    date = journal_entry["date"]
    journal_summary = journal_entry["summary"]

    # Update existing document if the date matches
    update_result = collection.update_one(
        {"date": date},
        {"$unset": {"topic": ""},  # Remove 'topic' field
         "$set": {"journal_summary": journal_summary}}
    )

    # If no matching document is found, insert a new one
    if update_result.matched_count == 0:
        new_entry = {
            "date": date,
            "journal_summary": journal_summary,
            "overall_mood": journal_entry["overall_mood"]
        }
        collection.insert_one(new_entry)

print("Journal summaries updated and inserted successfully!")