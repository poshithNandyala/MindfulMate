import json
from langchain.text_splitter import RecursiveCharacterTextSplitter
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from tqdm import tqdm
import time


def generate_chunk_json(transcript_path, chunked_transcript_path):
    with open(transcript_path, "r") as file:
        transcript = json.load(file)

    utterances = transcript["utterances"]

    # convert transcript into a single string
    full_text = ""
    metadata = []

    for utterance in utterances:
        speaker = utterance["speaker"]
        text = utterance["text"]
        full_text += f"{speaker}: {text}\n"
        metadata.append({"speaker": speaker, "text": text})

    # Use the splitter
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )

    chunks = splitter.split_text(full_text)

    # Store chunks and metadata in a JSON file
    chunked_data = [{"text": chunk, "session_id": transcript["session_id"]} for chunk in chunks]

    with open(chunked_transcript_path, "w") as file:
        json.dump(chunked_data, file, indent=4)

    print(f"Transcript successfully chunked and saved to {chunked_transcript_path}.")


def generate_embeddings(chunked_transcript_path, embedded_transcript_path):
    load_dotenv()

    with open(chunked_transcript_path, "r") as file:
        chunked_transcript = json.load(file)

    # Initialize the OpenAIEmbeddings class
    embedder = OpenAIEmbeddings()

    embedded_chunks = []
    # Generate embeddings for each chunk
    for chunk in tqdm(chunked_transcript, desc="Generating OpenAI Embeddings"):
        try:
            embedding = embedder.embed_query(chunk["text"])
            embedded_chunks.append({
                "text": chunk["text"],
                "session_id": chunk["session_id"],
                "embedding": embedding
            })
        except Exception as e:
            print(f"Error generating embedding: {e}")
        time.sleep(0.5)  # Prevent hitting OpenAI rate limits

    with open(embedded_transcript_path, "w") as file:
        json.dump(embedded_chunks, file, indent=4)

    print(f"Embeddings generated! {len(embedded_chunks)} chunks saved to {embedded_transcript_path}.")