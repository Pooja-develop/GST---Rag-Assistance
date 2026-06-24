# GSTMitra AI — GST Compliance Assistant

A RAG-based chatbot that answers GST questions using actual CBIC government documents, so small business owners don't have to call a CA for every basic doubt.

## Why I built this

I saw a real case where a friend's father had to shut down a small business and told his accountant to "close everything." The accountant never filed the final GST return properly, and months later he got a ₹10,000 penalty notice he didn't understand at all. That stuck with me — most small business owners have zero visibility into GST rules and depend completely on their CA, who isn't always available or doesn't always explain things clearly.

So I built something that answers GST questions instantly, with the actual government circular cited, so people can at least understand what's happening before they panic or pay a penalty they didn't need to.

## What it does

- Answers GST questions using real CBIC documents (not generic knowledge) — every answer shows which document/page it came from
- ITC Eligibility Checker — tell it your business type and what you bought, it tells you if you can claim input tax credit
- Penalty Calculator — enter return type and days late, get the actual penalty breakdown
- Filing Deadline Reminder — shows due dates based on business type (regular/composition/quarterly)
- Notice Explainer — paste a GST notice, get it explained in plain language with next steps
- Works in English, Hindi, and Tamil
- Saves chat history in SQLite so you can see past queries

## Tech stack

- Frontend: React
- Backend: Python, Flask
- RAG: LangChain + ChromaDB
- LLM: Groq (LLaMA 3.1) — switched from Gemini after hitting free-tier quota limits
- Embeddings: HuggingFace sentence-transformers
- Database: SQLite (chat history + feature usage logging)

## Why these choices

- **Groq instead of OpenAI/Gemini** — free tier on Gemini ran out fast during testing, Groq's LLaMA models gave faster responses with no daily quota issues.
- **ChromaDB** — simplest local vector store to set up for a project this size, no external service needed.

## Running it locally

### Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py

### Frontend
cd frontend-react
npm install
npm start
You'll need a `.env` file in `backend/` with:
GROQ_API_KEY=your_key_here

## What I'd improve next

- Add real-time sync with CBIC website so new circulars update the knowledge base automatically
- Move from SQLite to PostgreSQL if this needed to support multiple concurrent users
- Add a WhatsApp integration since most small business owners use WhatsApp more than web apps
- Deploy it live (currently runs locally — ran into memory limits on free-tier hosting while figuring out deployment)