import weaviate
import weaviate.classes as wvc
import os
from dotenv import load_dotenv
import json
from tqdm import tqdm

# Load Weaviate API Key and URL from .env file
load_dotenv()
WCD_URL = os.getenv("WCD_URL")
WCD_API_KEY = os.getenv("WCD_API_KEY")

# Ensure Environment Variables Are Loaded
if not WCD_URL or not WCD_API_KEY:
    raise ValueError("ERROR: WCD_URL or WCD_API_KEY is missing. Check your .env file!")

def get_client():
    """
    Connect to Weaviate Cloud using the provided API key and URL.
    :return: the Weaviate client object
    """
    # Connect to Weaviate Cloud
    client = weaviate.connect_to_weaviate_cloud(
        cluster_url=WCD_URL,
        auth_credentials=wvc.init.Auth.api_key(WCD_API_KEY)
    )

    return client

def handle_schema_creation(client=get_client()):
    """
    Generate collection schema for storing therapy session transcripts.
    :param client: the Weaviate client object
    :return: None
    """
    try:
        # Define Schema for TherapySession Collection
        if "TherapySession" not in [col.name for col in client.collections.list_all()]:
            therapy_session = client.collections.create(
                name="TherapySession",
                description="A collection of therapy session transcripts.",
                vectorizer_config=wvc.config.Configure.Vectorizer.none(),  # We'll provide our own OpenAI embeddings
                properties=[
                    wvc.config.Property(
                        name="session_id",
                        data_type=wvc.config.DataType.TEXT,
                    ),
                    wvc.config.Property(
                        name="text",
                        data_type=wvc.config.DataType.TEXT,
                    )
                ]
            )
            print("TherapySession schema created successfully!")

            # Print schema details for verification
            print(therapy_session.config.get(simple=False))
        else:
            print("TherapySession schema already exists!")

    finally:
        # Close connection to prevent memory leaks
        client.close()


def upload_embedded_transcripts(client=get_client(), embedded_transcript_path=None):
    """
    Upload embedded therapy session transcripts to Weaviate.
    :param client: the Weaviate client object
    :param embedded_transcript_path: .json file containing embedded transcripts
    :return: None
    """
    try:
        # Load embedded transcripts from JSON file
        with open(embedded_transcript_path, "r") as file:
            embedded_transcripts = json.load(file)

        # Get TherapySession class
        therapy_session_class = client.collections.get("TherapySession")

        # Upload each chunk to TherapySession collection
        for chunk in tqdm(embedded_transcripts, desc="Uploading Chunks to Weaviate"):
            therapy_session_class.data.insert(
                properties={
                    "session_id": chunk["session_id"],
                    "text": chunk["text"],
                },
                vector=chunk["embedding"]  # Store OpenAI-generated vector
            )

        print("All chunks uploaded to Weaviate successfully!")

    finally:
        # Close connection to prevent memory leaks
        client.close()