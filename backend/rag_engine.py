import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
load_dotenv()
os.environ["TOKENIZERS_PARALLELISM"] = "false"
def load_documents():
    loader = PyPDFDirectoryLoader("data/")
    documents = loader.load()
    print(f"Loaded {len(documents)} pages")
    return documents
def split_documents(documents):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = splitter.split_documents(documents)
    print(f"Created {len(chunks)} chunks")
    return chunks
def create_vectorstore(chunks):
    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2"
    )
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory="vectorstore/"
    )
    print("Vector store created!")
    return vectorstore
def load_vectorstore():
    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2"
    )
    vectorstore = Chroma(
        persist_directory="vectorstore/",
        embedding_function=embeddings
    )
    return vectorstore
def get_prompt(language="english"):
    if language == "tamil":
        lang_instruction = "Answer in Tamil language."
    elif language == "hindi":
        lang_instruction = "Answer in Hindi language."
    else:
        lang_instruction = "Answer in simple English."

    template = f"""
    You are GSTMitra AI, a helpful GST compliance assistant for Indian businesses.
    Answer questions based only on the provided GST documents.
    Give clear simple answers that a non-expert business owner can understand.
    Always mention which GST rule or circular your answer is based on.
    If you don't know say "Please consult a CA for this specific query."
    {lang_instruction}

    Context: {{context}}
    Question: {{question}}

    Answer:
    """
    return PromptTemplate(
        template=template,
        input_variables=["context", "question"]
    )
def create_qa_chain(vectorstore, language="english"):
    llm = ChatGroq(
        model="llama-3.1-8b-instant",
        api_key=os.getenv("GROQ_API_KEY"),
        temperature=0.3
    )
    # k=3 gives enough context without hitting Groq's token limits
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    prompt = get_prompt(language)

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    chain = (
        {
            "context": retriever | format_docs,
            "question": RunnablePassthrough()
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain, retriever
def initialize_rag():
    if os.path.exists("vectorstore/") and os.listdir("vectorstore/"):
        print("Loading existing vector store...")
        vectorstore = load_vectorstore()
    elif os.path.exists("data/") and os.listdir("data/"):
        print("Building vector store for first time...")
        docs = load_documents()
        chunks = split_documents(docs)
        vectorstore = create_vectorstore(chunks)
    else:
        print("No data found - creating empty vectorstore...")
        from langchain_core.documents import Document
        dummy = [Document(page_content="GSTMitra AI is ready.", metadata={})]
        vectorstore = create_vectorstore(dummy)
    return vectorstore