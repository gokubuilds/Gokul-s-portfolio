import os
from langchain_groq import ChatGroq
from langchain_ollama import OllamaEmbeddings
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.retrieval_qa.base import RetrievalQA
from langchain_community.document_loaders import PyPDFLoader
# from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

# Configuration
KNOWLEDGE_BASE_DIR = r"C:\Users\gokul\gokul'sportfolio\chatbot_backend\knowledge_base\data.json"
CHROMA_DB_DIR = "chroma_db"
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
        jq_schema=".[]",
        text_content=False
    )

    documents = loader.load()
    print(documents)

    # 2. Split Documents
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    splits = text_splitter.split_documents(documents)

    # 3. Create Embeddings & VectorStore
    # We use HuggingFace embeddings which run locally and are free. 
    embeddings = OllamaEmbeddings(model="all-minilm:l6-v2")
    vectorstore = Chroma.from_documents(documents=splits, embedding=embeddings, persist_directory=CHROMA_DB_DIR)
    
    # 4. Setup Retriever
    # retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

    # 5. Setup LLM
    # Make sure GROQ_API_KEY is in your .env file
    llm = ChatGroq(model=GROQ_MODEL, temperature=0.3)

    # 6. Setup Prompt and Chain
    system_prompt = (
        "You are a helpful AI assistant representing Gokul Soundarapandian on his portfolio website. "
        "Use the following pieces of retrieved context to answer the user's question. "
        "If you don't know the answer, just say that you don't know or ask the user to contact Gokul directly. "
        "Keep the answers concise and professional.\n\n"
        "{context}"
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{question}"),
    ])

    chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=vectorstore.as_retriever(search_kwargs={"k": 4}),
            chain_type_kwargs={"prompt": prompt},
            return_source_documents=False,
        )
    rag_chain=chain
    return rag_chain

# Global instance
rag_chain_instance = None

def get_rag_chain():
    global rag_chain_instance
    if rag_chain_instance is None:
        try:
            rag_chain_instance = initialize_rag()
        except Exception as e:
            print(f"Error initializing RAG: {e}")
            return None
    return rag_chain_instance
