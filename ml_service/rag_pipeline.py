import os
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from sentence_transformers import SentenceTransformer
import numpy as np

# Use SentenceTransformers directly for FAISS embedding function to avoid relying on external API for embeddings
class LocalHuggingFaceEmbeddings:
    def __init__(self, model_name="all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
    
    def embed_documents(self, texts):
        embeddings = self.model.encode(texts)
        return embeddings.tolist()
        
    def embed_query(self, text):
        embedding = self.model.encode([text])[0]
        return embedding.tolist()

embeddings_model = LocalHuggingFaceEmbeddings()
FAISS_INDEX_PATH = "faiss_index"

def get_or_create_vectorstore():
    if os.path.exists(FAISS_INDEX_PATH):
        try:
            return FAISS.load_local(FAISS_INDEX_PATH, embeddings_model, allow_dangerous_deserialization=True)
        except Exception as e:
            print(f"Error loading FAISS index: {e}. Creating new one.")
            return FAISS.from_texts(["Initial document to create schema"], embeddings_model)
    else:
        return FAISS.from_texts(["Initial document to create schema"], embeddings_model)

vectorstore = get_or_create_vectorstore()

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
    
    vectorstore.add_documents(documents)
    vectorstore.save_local(FAISS_INDEX_PATH)
    
    return len(chunks)

def query_rag(query: str, top_k: int = 4):
    """
    Retrieves the most relevant chunks from the FAISS database.
    """
    docs = vectorstore.similarity_search(query, k=top_k)
    
    # Format the context for the LLM prompt
    context = "\n\n".join([f"Source ({doc.metadata.get('filename', 'Unknown')}): {doc.page_content}" for doc in docs])
    return context
