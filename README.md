# GSTMitra AI — GST Compliance Assistant

AI-powered RAG based assistant that helps Indian small business 
owners understand GST rules, filing deadlines, ITC eligibility, 
and penalty notices — available 24/7 for free.

## Problem Statement
India has 1.4 crore GST registered businesses. Most small business 
owners pay ₹3000-5000/month to CAs just for basic GST queries. 
CA consultations are expensive and not available 24/7.

## Solution
GSTMitra AI answers GST questions instantly from official CBIC 
government documents using RAG — with source citations so every 
answer is trustworthy.

## Features
-  GST Q&A with CBIC source citations
-  ITC Eligibility Checker
-  Penalty Calculator for late filings
-  Filing Deadline Reminder
-  Notice Explainer in simple language
-  Chat History stored in SQLite
-  Multilingual — English Hindi Tamil
-  User Authentication — Signup and Signin

## Tech Stack
React | Python Flask | LangChain | ChromaDB | SQLite | Groq LLaMA 3.1 | HuggingFace Embeddings



## Local Setup

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