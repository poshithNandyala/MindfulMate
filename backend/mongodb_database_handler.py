from pymongo import MongoClient
from datetime import datetime, timedelta, timezone
from contextlib import contextmanager
from dotenv import load_dotenv
import os
import ssl
from local_storage import (
    save_journal_entry_local, 
    get_journals_by_username_local, 
    get_journals_by_date_local,
    upload_chat_in_conversation_local,
    get_past_conversations_local,
    get_chats_by_date_local,
    get_all_summaries_local
)


@contextmanager 
def get_mongo_client():
    """
    Context manager for MongoDB client to ensure proper cleanup
    :return: MongoDB client
    """
    load_dotenv()
    MONGO_URI = os.getenv("MONGO_URI")
    if not MONGO_URI:
        raise ValueError("MONGO_URI not found in environment variables")
    
    # Simple, fast connection for production
    client = MongoClient(
        MONGO_URI,
        connectTimeoutMS=3000,  # Very short timeout
        serverSelectionTimeoutMS=3000,
        socketTimeoutMS=3000
    )
    try:
        yield client
    finally:
        client.close()


def get_mongo_collection(collection_name="conversation"):
    """
    Get the mentioned MongoDB collection from the database
    :param collection_name: the collection to retrieve
    :return: the collection object
    """
    load_dotenv()
    MONGO_URI = os.getenv("MONGO_URI")
    if not MONGO_URI:
        raise ValueError("MONGO_URI not found in environment variables")
    
    # Fast MongoDB connection without ping test
    try:
        client = MongoClient(
            MONGO_URI,
            connectTimeoutMS=3000,  # 3 second timeout
            serverSelectionTimeoutMS=3000,
            socketTimeoutMS=3000
        )
        db = client["chatbot_db"]
        collection = db[collection_name]
        return collection
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        # Fallback to local storage
        raise Exception(f"MongoDB connection failed: {e}")


def get_all_summaries():
    """
    Function to get all summaries from the database sorted in descending order by date
    :return: list of all summaries
    """
    # Use local storage directly for production
    try:
        return get_all_summaries_local()
    except Exception as e:
        print(f"Failed to get summaries: {e}")
        return []


def get_past_conversations(limit=10):
    """
    Return a list of past messages. Sorted in descending order by date.
    :param limit: Number of messages to retrieve
    :return: list of past 'limit' conversations
    """
    try:
        # Try MongoDB first
        collection = get_mongo_collection("conversation")
        past_messages = (collection.find({}, {"user_input": 1, "response": 1, "_id": 0})
                         .sort([("timestamp", -1)])
                         .limit(limit))
        formatted_messages = [{"user_input": message["user_input"],
                               "response": message["response"]}
                              for message in past_messages]
        return formatted_messages
    except Exception as e:
        print(f"MongoDB failed, using local storage: {e}")
        # Fallback to local storage
        try:
            return get_past_conversations_local(limit)
        except Exception as e2:
            print(f"Local storage also failed: {e2}")
            return []


def save_journal_entry(title: str, entry: str, username: str):
    """
    Store a new journal entry in the journal collection.
    :param title: Title of the journal entry
    :param entry: The journal entry text
    :param username: Username of the person creating the journal
    :return: Inserted journal entry ID
    """
    try:
        # Try MongoDB first
        collection = get_mongo_collection("journal")

        # Create a dictionary to store the journal entry
        journal_entry = {
            "title": title,
            "entry": entry,
            "username": username,
            "timestamp": datetime.now(timezone.utc)
        }

        # Insert the journal entry into the collection
        result = collection.insert_one(journal_entry)
        return str(result.inserted_id)

    except Exception as e:
        print(f"MongoDB failed, using local storage: {e}")
        # Fall back to local storage
        return save_journal_entry_local(title, entry, username)


def get_journals_by_username(username: str):
    """
    Retrieve all journal entries for a specific user, sorted by timestamp (most recent first).
    
    :param username: Username to filter journals by
    :return: List of journal entries for that user
    """
    try:
        # Try MongoDB first
        collection = get_mongo_collection("journal")

        print(f"Fetching journal entries for user: {username}")
        
        # Query using username filter, sorted by timestamp descending (most recent first)
        journals = list(collection.find({
            "username": username
        }).sort("timestamp", -1))

        # Convert ObjectId to string and timestamp to ISO format
        for journal in journals:
            journal["_id"] = str(journal["_id"])
            journal["timestamp"] = journal["timestamp"].isoformat()

        return journals

    except Exception as e:
        print(f"MongoDB failed, using local storage: {e}")
        # Fall back to local storage
        return get_journals_by_username_local(username)


def get_journals_by_date(date: str):
    """
    Retrieve all journal entries that match the given date string (YYYY-MM-DD).

    :param date: Date in YYYY-MM-DD format.
    :return: List of journal entries for that date.
    """
    try:
        # Get the collection
        collection = get_mongo_collection("journal")

        print(f"Fetching entries for date: {date}")
        # Convert date string to datetime objects
        start_date = datetime.strptime(date, "%Y-%m-%d")
        end_date = start_date + timedelta(days=1)

        # Query using datetime comparison
        journals = list(collection.find({
            "timestamp": {
                "$gte": start_date,
                "$lt": end_date
            }
        }).sort("timestamp", 1))  # Sort by timestamp in ascending order

        # Convert ObjectId to string (but do not modify timestamp)
        for journal in journals:
            journal["_id"] = str(journal["_id"])
            journal["timestamp"] = journal["timestamp"].isoformat()

        return journals

    except Exception as e:
        raise Exception(f"Error fetching journal entries: {e}")


def get_chats_by_date(date: str):
    """
    Fetch chatbot conversations for a given date, sorted by timestamp.
    :param date: Date in YYYY-MM-DD format
    :return: List of conversations
    """
    try:
        # Try MongoDB first
        collection = get_mongo_collection("conversation")
        start_date = datetime.strptime(date, "%Y-%m-%d")
        end_date = start_date + timedelta(days=1)
        
        conversations = list(collection.find(
            {"timestamp": {"$gte": start_date, "$lt": end_date}}
        ).sort("timestamp", 1))
        
        for convo in conversations:
            convo["_id"] = str(convo["_id"])
            convo["timestamp"] = convo["timestamp"].isoformat()
        
        return conversations
    except Exception as e:
        print(f"MongoDB failed, using local storage: {e}")
        # Fallback to local storage
        try:
            return get_chats_by_date_local(date)
        except Exception as e2:
            print(f"Local storage also failed: {e2}")
            return []


def upload_chat_in_conversation(user_prompt, sentiment_score, result):
    """
    Upload the chat in the conversation collection
    :param user_prompt: prompt given by the user
    :param sentiment_score: sentiment score of the prompt
    :param result: response by the chatbot
    :return: None
    """
    try:
        # Try MongoDB first
        collection = get_mongo_collection("conversation")
        collection.insert_one(
            {"user_input": user_prompt,
             "sentiment_score": sentiment_score,
             "response": result,
             "timestamp": datetime.now(timezone.utc)}
        )
        print("Chat saved to MongoDB successfully")
    except Exception as e:
        print(f"MongoDB failed, using local storage: {e}")
        # Fallback to local storage
        try:
            upload_chat_in_conversation_local(user_prompt, sentiment_score, result)
            print("Chat saved to local storage successfully")
        except Exception as e2:
            print(f"Local storage also failed: {e2}")