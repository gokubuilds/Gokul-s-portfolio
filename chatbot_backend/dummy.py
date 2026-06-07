KNOWLEDGE_BASE_DIR = r"C:\Users\gokul\gokul'sportfolio\chatbot_backend\knowledge_base\data.json"
CHROMA_DB_DIR = "chroma_db"
from dotenv import load_dotenv
import os
from dotenv import load_dotenv
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

def initialize_rag():
    # 1. Load Documents
    # loader = PyPDFLoader(KNOWLEDGE_BASE_DIR)
    # documents = loader.load()

    #json loader
    from langchain_community.document_loaders import JSONLoader

# The jq_schema parameter specifies the JSON pointer to your content
    loader = JSONLoader(
        file_path=KNOWLEDGE_BASE_DIR,
        jq_schema='.[]',
        text_content=False
    )

    documents = loader.load()
    print(documents)
initialize_rag()