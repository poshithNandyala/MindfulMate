from pymongo import MongoClient
from datetime import datetime, timedelta, timezone
from contextlib import contextmanager


@contextmanager 
def get_mongo_client():
    """
    Context manager for MongoDB client to ensure proper cleanup
    :return: MongoDB client
    """
    MONGO_URL = "mongodb+srv://jc4320:uaerobp43ssuhnNl@cluster0.2tfqs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    client = MongoClient(MONGO_URL)
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
    MONGO_URL = "mongodb+srv://jc4320:uaerobp43ssuhnNl@cluster0.2tfqs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    client = MongoClient(MONGO_URL)
    db = client["chatbot_db"]
    collection = db[collection_name]

    return collection


def get_all_summaries():
    """
    Function to get all summaries from the database sorted in descending order by date
    :return: list of all summaries
    """
    # Get the collection
    collection = get_mongo_collection("summary")

    # Query to get all summaries sorted by date in descending order
    results = collection.find({}, {"_id": 0}).sort("date", -1)
    results = list(results)

    return results


def get_past_conversations(limit=10):
    """
    Return a list of past messages. Sorted in descending order by date.
    :param limit: Number of messages to retrieve
    :return: list of past 'limit' conversations
    """
    # Get the collection
    collection = get_mongo_collection("conversation")

    # Query to get the past messages sorted by date in descending order
    past_messages = (collection.find({}, {"user_input": 1, "response": 1, "_id": 0})
                     .sort([("timestamp", -1)])
                     .limit(limit))

    # Format the messages
    formatted_messages = [{"user_input": message["user_input"],
                           "response": message["response"]}
                          for message in past_messages]

    return formatted_messages


def save_journal_entry(title: str, entry: str):
    """
    Store a new journal entry in the journal collection.
    :param title: Title of the journal entry
    :param entry: The journal entry text
    :return: Inserted journal entry ID
    """
    try:
        # Get the collection
        collection = get_mongo_collection("journal")

        # Create a dictionary to store the journal entry
        journal_entry = {
            "title": title,
            "entry": entry,
            "timestamp": datetime.now(timezone.utc)
        }

        # Insert the journal entry into the collection
        result = collection.insert_one(journal_entry)
        return str(result.inserted_id)

    except Exception as e:
        raise Exception(f"Error saving journal entry: {e}")


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
        # Get the collection
        collection = get_mongo_collection("conversation")

        # Convert date string to datetime objects
        start_date = datetime.strptime(date, "%Y-%m-%d")
        end_date = start_date + timedelta(days=1)

        # Query MongoDB for records within the given date range
        conversations = list(collection.find(
            {"timestamp": {"$gte": start_date,
                           "$lt": end_date}}
        ).sort("timestamp", 1))

        # Convert ObjectId and timestamp to readable format
        for convo in conversations:
            convo["_id"] = str(convo["_id"])  # Convert ObjectId to string
            convo["timestamp"] = convo["timestamp"].isoformat()  # Convert timestamp to readable format

        return conversations

    except Exception as e:
        raise Exception(f"Error fetching conversations: {e}")


def upload_chat_in_conversation(user_prompt, sentiment_score, result):
    """
    Upload the chat in the conversation collection
    :param user_prompt: prompt given by the user
    :param sentiment_score: sentiment score of the prompt
    :param result: response by the chatbot
    :return: None
    """
    # Get the collection
    collection = get_mongo_collection("conversation")

    # Insert the chat into the collection
    collection.insert_one(
        {"user_input": user_prompt,
         "sentiment_score": sentiment_score,
         "response": result,
         "timestamp": datetime.now(timezone.utc)}
    )