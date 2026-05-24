import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings

FAISS_INDEX_PATH = "faiss_index"
_vectorstore = None

def get_embeddings():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    return GoogleGenerativeAIEmbeddings(model="models/text-embedding-004", google_api_key=api_key)

def get_or_create_vectorstore():
    global _vectorstore
    if _vectorstore is not None:
        return _vectorstore
        
    embeddings_model = get_embeddings()
    if os.path.exists(FAISS_INDEX_PATH):
        try:
            _vectorstore = FAISS.load_local(FAISS_INDEX_PATH, embeddings_model, allow_dangerous_deserialization=True)
            return _vectorstore
        except Exception as e:
            print(f"Error loading FAISS index: {e}. Creating new one.")
            _vectorstore = FAISS.from_texts(["Initial document to create schema"], embeddings_model)
            return _vectorstore
    else:
        _vectorstore = FAISS.from_texts(["Initial document to create schema"], embeddings_model)
        return _vectorstore

def ingest_document(text: str, metadata: dict = None):
    """
    Chunks a document and adds it to the FAISS vector database.
    """
    if not metadata:
        metadata = {}
        
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    
    chunks = text_splitter.split_text(text)
    
    documents = [Document(page_content=chunk, metadata=metadata) for chunk in chunks]
    
    vectorstore = get_or_create_vectorstore()
    vectorstore.add_documents(documents)
    vectorstore.save_local(FAISS_INDEX_PATH)
    
    return len(chunks)

def query_rag(query: str, top_k: int = 4):
    """
    Retrieves the most relevant chunks from the FAISS database.
    """
    vectorstore = get_or_create_vectorstore()
    docs = vectorstore.similarity_search(query, k=top_k)
    
    # Format the context for the LLM prompt
    context = "\n\n".join([f"Source ({doc.metadata.get('filename', 'Unknown')}): {doc.page_content}" for doc in docs])
    return context
