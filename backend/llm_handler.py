# To read API key from .env file
from dotenv import load_dotenv
# LangChain imports
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import OpenAIEmbeddings
# Hugging Face imports
from transformers import pipeline
# MongoDB Database Handler
from mongodb_database_handler import (upload_chat_in_conversation,
                                      get_past_conversations,
                                      get_all_summaries)
# Weaviate imports
import weaviate
import weaviate.classes as wvc
# Other imports
import os
import logging
from typing import Optional


def analyze_sentiment(text):
    """
    This functions takes in a text and returns the sentiment of the text.
    Current model used: cardiffnlp/twitter-roberta-base-sentiment-latest
    :param text: The text to score
    :return: a normalized sentiment score between -1 and 1
    """
    # Initialize the sentiment analysis pipeline
    sentiment_analyzer = pipeline("sentiment-analysis",
                                  model="cardiffnlp/twitter-roberta-base-sentiment-latest")
    # Get the sentiment of the text
    result = sentiment_analyzer(text)
    label = result[0]["label"].lower()
    score = result[0]["score"]

    # Normalize the sentiment score
    sentiment_mapping = {
        "positive": 1,
        "negative": -1,
        "neutral": 0
    }

    normalized_score = sentiment_mapping[label] * score

    if label == "neutral":
        if score > 0.7:
            normalized_score = 0.2
        elif normalized_score < 0.3:
            normalized_score = -0.2
        else:
            normalized_score = 0

    return normalized_score

def initialize_gemini_llm(model="gemini-1.5-flash"):
    """
    Initialize the Gemini LLM model
    :param model: Gemini model name (gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash-exp)
    :return: the Gemini LLM model object or None if failed
    """
    try:
        # Load environment variables
        load_dotenv()
        
        google_api_key = os.getenv("GOOGLE_API_KEY")
        if not google_api_key:
            logging.warning("GOOGLE_API_KEY not found in environment variables")
            return None
            
        # Initialize the Gemini LLM model with current model names
        llm_gemini = ChatGoogleGenerativeAI(
            model=model,
            google_api_key=google_api_key,
            temperature=0.7,
            convert_system_message_to_human=True,  # Gemini doesn't support system messages
            max_retries=2,  # Limit retries for faster fallback
            request_timeout=30  # 30 second timeout
        )
        
        return llm_gemini
        
    except Exception as e:
        logging.error(f"Failed to initialize Gemini LLM: {e}")
        return None

def initialize_openai_llm(model="gpt-4o-mini"):
    """
    Initialize the OpenAI LLM model (ChatGPT)
    Also, includes getting API key from .env file
    Current models used: gpt-4o, gpt-4o-mini
    :return: the OpenAI LLM model object
    """
    # Load environment variables
    load_dotenv()

    # Initialize the LLM model
    llm_openai = ChatOpenAI(model=model)

    return llm_openai

def initialize_llm_with_fallback(gemini_model="gemini-1.5-flash", openai_model="gpt-4o"):
    """
    Initialize LLM with Gemini as primary and OpenAI as fallback
    :param gemini_model: Gemini model name (gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash-exp)
    :param openai_model: OpenAI model name for fallback
    :return: tuple (primary_llm, fallback_llm, primary_type)
    """
    primary_llm = initialize_gemini_llm(gemini_model)
    fallback_llm = initialize_openai_llm(openai_model)
    
    if primary_llm is not None:
        return primary_llm, fallback_llm, "gemini"
    else:
        logging.warning("Gemini initialization failed, using OpenAI as primary")
        return fallback_llm, None, "openai"

# Backward compatibility
def initialize_llm(model="gpt-4o-mini"):
    """
    Legacy function for backward compatibility
    Initialize the LLM model
    Current models used: gpt-4o, gpt-4o-mini
    :return: the llm model object
    """
    return initialize_openai_llm(model)

def get_system_prompt():
    """
    Define the system prompt for the therapist chatbot
    :return: the system prompt
    """
    system_prompt = """
    You are a therapist. You have to be calm, gentle, understanding and empathetic. Dont give solutions only resonate. 
    Your task is to listen. If you do not understand what the user is saying, be patient, do not output gibberish.
    
    Here is the past conversation history:
    {past_conversation}
    
    Here are all available summaries from chat and journal entries:
    {summaries}
    
    Following is the user’s latest message.
    User: {user_input}
    
    Following is the sentiment score of the user's latest message: {sentiment_score} 
    The score ranges from -1 to 1. -1 means negative sentiment, 1 means positive sentiment and 0 means neutral sentiment. 
    You should consider the sentiment score while replying back to user's message. If the sentiment score is negative, 
    you should be more empathetic and understanding. If the sentiment score is positive, you should be more encouraging 
    and supportive but not too cheerful.
    
    Note: Do not repeat what the user is saying. Do not repeat exactly what the user is saying. If 
    you think the user is trying it get reassurance, go with flow and give him that reassurance, but dont be over excited.
    Try to have a conversation. And dont keep asking only questions. Keep it natural.
    """

    return system_prompt

def summarize(text):
    """
    Summarize the given text using the LLM model with fallback.
    Uses Gemini first, then falls back to GPT-4o-mini if needed.
    :param text: the text to summarize
    :return: the summarized text
    """
    try:
        # Initialize LLM with fallback mechanism
        primary_llm, fallback_llm, primary_type = initialize_llm_with_fallback(
            gemini_model="gemini-1.5-flash",
            openai_model="gpt-4o-mini"
        )
        
        prompt_template = PromptTemplate(
            template="""Your only task is to summarize the given text. Do not add any additional information.
            Each object has its own date.
            
            Text to summarize:
            {text}
            
            Summary:""",
            input_variables=["text"]
        )
        
        # Create an output parser
        output_parser = StrOutputParser()
        
        # Define the chain of operations
        chain = prompt_template | primary_llm | output_parser
        
        # Invoke the chain with fallback mechanism
        result, used_model = invoke_llm_with_fallback(chain, primary_llm, fallback_llm, primary_type)
        
        logging.info(f"📝 Summary generated using: {used_model}")
        return result
        
    except Exception as e:
        logging.error(f"❌ Summarization failed: {e}")
        return "Summary generation failed"

def invoke_llm_with_fallback(chain, primary_llm, fallback_llm, primary_type):
    """
    Invoke LLM chain with fallback mechanism
    :param chain: The LangChain chain to invoke
    :param primary_llm: Primary LLM instance
    :param fallback_llm: Fallback LLM instance
    :param primary_type: Type of primary LLM ("gemini" or "openai")
    :return: tuple (result, used_model_type)
    """
    try:
        # Try primary LLM (Gemini)
        if primary_type == "gemini":
            logging.info("Attempting to use Gemini API...")
            result = chain.invoke({})
            logging.info("Gemini API call successful")
            return result, "gemini"
        else:
            # Primary is already OpenAI
            logging.info("Using OpenAI API as primary...")
            result = chain.invoke({})
            logging.info("OpenAI API call successful")
            return result, "openai"
            
    except Exception as e:
        error_msg = str(e)
        logging.error(f"{primary_type.capitalize()} API call failed: {error_msg}")
        
        # Check for specific Gemini errors that indicate immediate fallback
        gemini_fallback_errors = [
            "404",
            "not found",
            "not supported",
            "models/gemini-pro is not found",
            "api version",
            "NotFound"
        ]
        
        should_fallback_immediately = any(err in error_msg for err in gemini_fallback_errors)
        
        if fallback_llm is not None and primary_type == "gemini":
            try:
                if should_fallback_immediately:
                    logging.warning("Gemini model not available, immediately falling back to OpenAI...")
                else:
                    logging.info("Falling back to OpenAI ChatGPT...")
                    
                # Recreate chain with fallback LLM
                fallback_chain = chain.first | fallback_llm | chain.last
                result = fallback_chain.invoke({})
                logging.info("OpenAI fallback successful")
                return result, "openai_fallback"
                
            except Exception as fallback_error:
                logging.error(f"OpenAI fallback also failed: {fallback_error}")
                raise Exception(f"Both Gemini and OpenAI failed. Gemini: {error_msg}, OpenAI: {str(fallback_error)}")
        else:
            raise Exception(f"LLM call failed and no fallback available: {error_msg}")

def get_results(user_prompt):
    """
    Receives user's prompt from the user. Invokes the LLM model to get the response.
    Uses Gemini as primary with ChatGPT as fallback.
    :param user_prompt: the user's input query
    :return: the response from the LLM model
    """
    # Initialize LLM with fallback mechanism
    primary_llm, fallback_llm, primary_type = initialize_llm_with_fallback(
        gemini_model="gemini-1.5-flash",
        openai_model="gpt-4o"
    )

    # Get system prompt
    system_prompt = get_system_prompt()

    # Short Term Context - Last 10 conversation
    # Get past conversations
    past_conversations = get_past_conversations(limit=10)
    # Convert past conversations into a string
    past_conversations_context = "\n".join([f"user_input: {msg['user_input']}\nresponse: {msg['response']}"
                                            for msg in past_conversations])

    # Long Term context - All summaries
    summaries = get_all_summaries()
    # Format summaries and convert into a string
    summaries_context = "\n".join([
        f"Date: {s['date']}\nOverall Mood: {s['overall_mood']}\nSentiment Score: {s['sentiment_score']}\n"
        f"Chat Summary: {s['chat_summary']}\nJournal Summary: {s['journal_summary']}\n"
        for s in summaries]) if summaries else "No summaries available."

    # Get the normalized sentiment score of the user's prompt
    sentiment_score = analyze_sentiment(user_prompt)

    # Format the system prompt with context
    formatted_prompt = system_prompt.format(past_conversation=past_conversations_context,
                                            user_input=user_prompt,
                                            sentiment_score=sentiment_score,
                                            summaries=summaries_context)

    # Create a prompt template
    prompt = PromptTemplate(
        template=formatted_prompt,
        input_variables=[]
    )

    # Create an output parser
    output_parser = StrOutputParser()

    # Define the chain of operations
    chain = prompt | primary_llm | output_parser

    # Invoke the chain with fallback mechanism
    result, used_model = invoke_llm_with_fallback(chain, primary_llm, fallback_llm, primary_type)
    
    # Log which model was used
    logging.info(f"Response generated using: {used_model}")

    # Upload the chat in the conversation collection in MongoDB
    upload_chat_in_conversation(user_prompt, sentiment_score, result)

    return result

def retrieve_relevant_chunks(user_prompt, top_k=5):
    """
    Retrieve the top-k most relevant chunks of text from Weaviate DB based on the user's prompt.
    :param user_prompt: The user's input query
    :param top_k: Number of relevant results to return
    :return: List of relevant text chunks with session ID and similarity score
    """

    # Load environment variables
    load_dotenv()
    WCD_URL = os.getenv("WCD_URL")
    WCD_API_KEY = os.getenv("WCD_API_KEY")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    # Check if environment variables are set
    if not WCD_URL or not WCD_API_KEY or not OPENAI_API_KEY:
        raise ValueError("ERROR: Missing required environment variables in .env file!")

    # Connect to Weaviate
    client = weaviate.connect_to_weaviate_cloud(
        cluster_url=WCD_URL,
        auth_credentials=wvc.init.Auth.api_key(WCD_API_KEY)
    )

    # Initialize OpenAI LangChain Embeddings
    embedder = OpenAIEmbeddings()

    try:
        # Convert User Prompt to OpenAI Embedding
        query_embedding = embedder.embed_query(user_prompt)

        # Perform Vector Search in Weaviate
        therapy_session = client.collections.get("TherapySession")

        # Perform Vector Search
        results = therapy_session.query.near_vector(
            near_vector=query_embedding,
            limit=top_k,
            return_metadata=wvc.query.MetadataQuery(distance=True),  # ✅ Corrected
        )

        # Extract Retrieved Chunks Safely
        relevant_chunks = []
        if results.objects:  # Ensure objects exist in the response
            for result in results.objects:
                relevant_chunks.append({
                    "text": result.properties.get("text", ""),
                    "session_id": result.properties.get("session_id", ""),
                    "score": getattr(result.metadata, "score", 0)
                })

        return relevant_chunks

    finally:
        client.close()