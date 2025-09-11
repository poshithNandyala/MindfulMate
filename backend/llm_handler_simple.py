# Simple version of LLM handler without MongoDB for testing
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
import os
import logging

def initialize_gemini_llm(model="gemini-1.5-flash"):
    """Initialize Gemini LLM"""
    try:
        load_dotenv()
        google_api_key = os.getenv("GOOGLE_API_KEY")
        if not google_api_key:
            return None
            
        llm_gemini = ChatGoogleGenerativeAI(
            model=model,
            google_api_key=google_api_key,
            temperature=0.7,
            convert_system_message_to_human=True,
            max_retries=2
        )
        return llm_gemini
    except Exception as e:
        logging.error(f"Failed to initialize Gemini: {e}")
        return None

def initialize_openai_llm(model="gpt-4o"):
    """Initialize OpenAI LLM"""
    try:
        load_dotenv()
        return ChatOpenAI(model=model)
    except Exception as e:
        logging.error(f"Failed to initialize OpenAI: {e}")
        return None

def get_simple_response(user_prompt):
    """Get response from Gemini with fallback, no MongoDB"""
    try:
        # Try Gemini first
        gemini = initialize_gemini_llm()
        if gemini:
            print(f"Using Gemini for: {user_prompt[:50]}...")
            
            prompt = PromptTemplate(
                template="""You are a compassionate therapist. Be calm, gentle, understanding and empathetic. 
                Listen to the user and provide supportive responses. Do not give solutions, just resonate and be supportive.
                
                User: {user_input}
                
                Therapist:""",
                input_variables=["user_input"]
            )
            
            chain = prompt | gemini | StrOutputParser()
            response = chain.invoke({"user_input": user_prompt})
            print(f"✅ Gemini response received")
            return response
            
    except Exception as e:
        print(f"❌ Gemini failed: {e}")
        
    # Fallback to OpenAI
    try:
        openai = initialize_openai_llm()
        if openai:
            print("🔄 Falling back to OpenAI...")
            
            prompt = PromptTemplate(
                template="""You are a compassionate therapist. Be calm, gentle, understanding and empathetic.
                
                User: {user_input}
                
                Therapist:""",
                input_variables=["user_input"]
            )
            
            chain = prompt | openai | StrOutputParser()
            response = chain.invoke({"user_input": user_prompt})
            print(f"✅ OpenAI response received")
            return response
            
    except Exception as e:
        print(f"❌ OpenAI also failed: {e}")
        return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment."
