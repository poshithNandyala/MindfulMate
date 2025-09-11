from generate_transcript_embeddings import generate_chunk_json, generate_embeddings
from vector_database_handler import handle_schema_creation, upload_embedded_transcripts
import uvicorn
import logging
from fast_api import app

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('mental_health_app.log'),
        logging.StreamHandler()
    ]
)

# All file paths
json_transcript_path = "transcript.json"
json_chunked_transcript_path = "chunked_transcript.json"
json_embedded_transcript_path = "embedded_transcript.json"

# Choose actions to perform
GENERATE_TRANSCRIPT_EMBEDDINGS = False
UPLOAD_TRANSCRIPT_IN_VECTOR_DATABASE = False
START_FAST_API_SERVER = True

def generate_transcript_embeddings(transcript_path, chunked_transcript_path, embedded_transcript_path):
    """
    function handling the generation of transcript embeddings
    :param transcript_path: path to .json file containing the transcript
    :param chunked_transcript_path: .json file to save the chunked transcript
    :param embedded_transcript_path: .json file to save the embedded transcript
    :return: None
    """
    generate_chunk_json(transcript_path, chunked_transcript_path)
    generate_embeddings(chunked_transcript_path, embedded_transcript_path)


def upload_transcript_in_vector_database(embedded_transcript_path):
    """
    Function to upload the embedded transcripts to vector database (Weaviate here)
    :param embedded_transcript_path:
    :return: None
    """
    handle_schema_creation()
    upload_embedded_transcripts(embedded_transcript_path)


def start_fast_api_server():
    """
    Function to start the FastAPI server
    :return: None
    """
    uvicorn.run(app, host="0.0.0.0", port=8000)


def main():
    """
    Main function to call the above functions
    :return: None
    """
    if GENERATE_TRANSCRIPT_EMBEDDINGS:
        generate_transcript_embeddings(json_transcript_path, json_chunked_transcript_path, json_embedded_transcript_path)

    if UPLOAD_TRANSCRIPT_IN_VECTOR_DATABASE:
        upload_transcript_in_vector_database(json_embedded_transcript_path)

    if START_FAST_API_SERVER:
        start_fast_api_server()


if __name__ == "__main__":
    main()