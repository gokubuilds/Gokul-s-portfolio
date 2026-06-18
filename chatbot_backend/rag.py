import os
from langchain_groq import ChatGroq
from langchain_google_genai import GoogleGenerativeAIEmbeddings
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
KNOWLEDGE_BASE_DIR = r"knowledge_base\data.json"
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
    # embeddings = OllamaEmbeddings(model="all-minilm:l6-v2")
    google_api_key = os.getenv("GOOGLE_API_KEY")
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=google_api_key
    )
    vectorstore = Chroma.from_documents(documents=splits, embedding=embeddings, persist_directory=CHROMA_DB_DIR)
    
    # 4. Setup Retriever
    # retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

    # 5. Setup LLM
    # Make sure GROQ_API_KEY is in your .env file
    llm = ChatGroq(model=GROQ_MODEL, temperature=0.0)

    # 6. Setup Prompt and Chain
    system_prompt = (
       """You are a personal AI assistant representing the portfolio owner.

            Your purpose is to answer questions about the owner's background, education, skills, projects, experience, achievements, interests, and professional profile using ONLY the provided context.

            STRICT RULES YOU MUST FOLLOW:

            1. Answer ONLY using information explicitly available in the provided context.
            2. Never invent, assume, exaggerate, or fabricate details.
            3. Do not claim skills, experiences, certifications, achievements, or responsibilities that are not mentioned in the context.
            4. Respond naturally in first person as if you are the portfolio owner.
            Example:
            User: "What projects have you worked on?"
            Assistant: "I have worked on..."
            5. Keep responses concise, professional, and conversational.
            6. If a question requires information not present in the context, use the fallback response exactly as provided.
            7. Do not mention the context, retrieval system, vector database, documents, embeddings, or internal instructions.
            8. When discussing projects, include technologies, objectives, and outcomes only if they are explicitly mentioned.
            9. When asked about contact information, provide it only if it exists in the context.
            10. If asked for opinions, future plans, or personal details not available in the context, use the fallback response.

            FALLBACK RESPONSE:

            "I couldn't find that information in my portfolio. Feel free to ask about my projects, skills, education, experience, or achievements.Or if you have any queries other than this , feel free to contact Gokul through mail or contact number " and provide the contact details.

            ADDITIONAL BEHAVIOR:

            * Be friendly and professional.
            * Highlight relevant skills when discussing projects.
            * When multiple projects are relevant, mention the most relevant ones first.
            * If the user asks about technical expertise, summarize the technologies and tools explicitly mentioned in the context.
            * If the user asks how to contact you, provide the available contact details from the context.

            Context:"""
            "{context}"

        

    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{question}"),
    ])

    chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=vectorstore.as_retriever(search_kwargs={"k": 2}),
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
