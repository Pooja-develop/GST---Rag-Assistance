from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from rag_engine import initialize_rag, create_qa_chain
from database import init_db, save_chat, get_history, get_usage_stats
import os

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

print("Initializing GSTMitra AI...")
vectorstore = initialize_rag()
init_db()
print("Ready!")

# structured prompt gets more useful answers than just passing raw notice text
@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.json
    question = data.get('question', '')
    language = data.get('language', 'english')

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    try:
        chain, retriever = create_qa_chain(vectorstore, language)
        answer = chain.invoke(question)
        docs = retriever.invoke(question)

        sources = []
        for doc in docs:
            sources.append({
                'page': doc.metadata.get('page', 'N/A'),
                'source': doc.metadata.get('source', 'GST Document')
            })

        save_chat('ask', question, answer, language)
        return jsonify({
            'answer': answer,
            'sources': sources
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/check-itc', methods=['POST'])
def check_itc():
    data = request.json
    business_type = data.get('business_type', '')
    purchase_item = data.get('purchase_item', '')
    language = data.get('language', 'english')

    if not business_type or not purchase_item:
        return jsonify({'error': 'Business type and purchase item required'}), 400

    question = f"""
    My business type is {business_type}.
    I purchased {purchase_item}.
    Am I eligible to claim Input Tax Credit ITC on this purchase?
    What are the conditions and which GST rule applies?
    """

    try:
        chain, retriever = create_qa_chain(vectorstore, language)
        answer = chain.invoke(question)
        docs = retriever.invoke(question)

        sources = []
        for doc in docs:
            sources.append({
                'page': doc.metadata.get('page', 'N/A'),
                'source': doc.metadata.get('source', 'GST Document')
            })

        save_chat('itc_checker', f"{business_type} | {purchase_item}", answer, language)
        return jsonify({
            'eligible': answer,
            'sources': sources
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# penalty calc uses hardcoded CBIC rules, not RAG - the rules are fixed by law
# so no need to query the vector store for this one
@app.route('/calculate-penalty', methods=['POST'])
def calculate_penalty():
    data = request.json
    return_type = data.get('return_type', '')
    days_late = int(data.get('days_late', 0))
    turnover = float(data.get('turnover', 0))

    if not return_type or days_late <= 0:
        return jsonify({'error': 'Return type and days late required'}), 400

    penalty = 0
    breakdown = []

    if return_type in ['GSTR-1', 'GSTR-3B']:
        if turnover == 0:
            late_fee = min(days_late * 20, 500)
            breakdown.append(f"Nil return late fee: ₹20/day x {days_late} days = ₹{late_fee}")
        else:
            late_fee = min(days_late * 50, 10000)
            breakdown.append(f"Late fee: ₹50/day x {days_late} days = ₹{late_fee}")

        if return_type == 'GSTR-3B' and turnover > 0:
            interest = (turnover * 0.18 * days_late) / 365
            breakdown.append(f"Interest 18% per annum: ₹{round(interest, 2)}")
            penalty = late_fee + interest
        else:
            penalty = late_fee

    elif return_type == 'GSTR-9':
        late_fee = min(days_late * 200, turnover * 0.0025)
        breakdown.append(f"Annual return late fee: ₹200/day x {days_late} days = ₹{round(late_fee, 2)}")
        breakdown.append(f"Maximum cap 0.25% of turnover = ₹{round(turnover * 0.0025, 2)}")
        penalty = late_fee

    return jsonify({
        'return_type': return_type,
        'days_late': days_late,
        'total_penalty': round(penalty, 2),
        'breakdown': breakdown,
        'note': 'This is an estimate. Consult a CA for exact calculation.'
    })


# hardcoded from CBIC official calendar - these dates don't change frequently
@app.route('/get-deadlines', methods=['GET'])
def get_deadlines():
    business_type = request.args.get('business_type', 'regular')

    deadlines = {
        "regular": [
            {"return": "GSTR-1", "due_date": "11th of every month", "description": "Monthly sales return"},
            {"return": "GSTR-3B", "due_date": "20th of every month", "description": "Monthly summary + tax payment"},
            {"return": "GSTR-9", "due_date": "31st December", "description": "Annual return"},
            {"return": "GSTR-9C", "due_date": "31st December", "description": "Annual reconciliation statement"}
        ],
        "composition": [
            {"return": "CMP-08", "due_date": "18th of month after quarter", "description": "Quarterly tax payment"},
            {"return": "GSTR-4", "due_date": "30th April every year", "description": "Annual return for composition dealers"}
        ],
        "quarterly": [
            {"return": "GSTR-1 IFF", "due_date": "13th of month after quarter", "description": "Quarterly sales return"},
            {"return": "GSTR-3B", "due_date": "22nd or 24th of month after quarter", "description": "Quarterly summary return"}
        ]
    }

    return jsonify({
        'business_type': business_type,
        'deadlines': deadlines.get(business_type, deadlines['regular']),
        'note': 'Always verify dates on gstin.gov.in'
    })



@app.route('/explain-notice', methods=['POST'])
def explain_notice():
    data = request.json
    notice_text = data.get('notice_text', '')
    language = data.get('language', 'english')

    if not notice_text:
        return jsonify({'error': 'Notice text required'}), 400

    question = f"""
    I received this GST notice:
    {notice_text}

    Please explain:
    1. What does this notice mean in simple words?
    2. Why did I receive this?
    3. What action should I take?
    4. What is the deadline to respond?
    5. What happens if I ignore it?
    """

    try:
        chain, retriever = create_qa_chain(vectorstore, language)
        answer = chain.invoke(question)
        docs = retriever.invoke(question)

        sources = []
        for doc in docs:
            sources.append({
                'page': doc.metadata.get('page', 'N/A'),
                'source': doc.metadata.get('source', 'GST Document')
            })

        save_chat('notice_explainer', notice_text[:200], answer, language)
        return jsonify({
            'explanation': answer,
            'sources': sources,
            'warning': 'For legal action on notices always consult a CA or tax advocate.'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/history', methods=['GET'])
def history():
    limit = int(request.args.get('limit', 20))
    return jsonify({'history': get_history(limit)})



@app.route('/stats', methods=['GET'])
def stats():
    return jsonify({'stats': get_usage_stats()})



@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'GSTMitra AI is running!'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)