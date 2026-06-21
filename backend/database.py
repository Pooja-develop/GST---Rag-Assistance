

import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "gstmitra.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Creates tables if they don't already exist. Safe to call every startup."""
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            feature TEXT NOT NULL,
            question TEXT NOT NULL,
            answer TEXT,
            language TEXT DEFAULT 'english',
            created_at TEXT NOT NULL
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS feature_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            feature TEXT NOT NULL,
            usage_count INTEGER DEFAULT 1,
            last_used TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()
    print("Database ready: gstmitra.db")


def save_chat(feature, question, answer, language="english"):
    """Insert one Q&A record and bump the feature usage counter."""
    conn = get_connection()
    cur = conn.cursor()
    now = datetime.now().isoformat()

    cur.execute(
        "INSERT INTO chat_history (feature, question, answer, language, created_at) VALUES (?, ?, ?, ?, ?)",
        (feature, question, answer, language, now)
    )

    
    cur.execute("SELECT id, usage_count FROM feature_usage WHERE feature = ?", (feature,))
    row = cur.fetchone()
    if row:
        cur.execute(
            "UPDATE feature_usage SET usage_count = ?, last_used = ? WHERE id = ?",
            (row["usage_count"] + 1, now, row["id"])
        )
    else:
        cur.execute(
            "INSERT INTO feature_usage (feature, usage_count, last_used) VALUES (?, ?, ?)",
            (feature, 1, now)
        )

    conn.commit()
    conn.close()


def get_history(limit=20):
    """Return the most recent chat records, newest first."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT feature, question, answer, language, created_at FROM chat_history ORDER BY id DESC LIMIT ?",
        (limit,)
    )
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_usage_stats():
    """Return per-feature usage counts — useful for a tiny analytics panel."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT feature, usage_count, last_used FROM feature_usage ORDER BY usage_count DESC")
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def clear_history():
    """Wipe chat history (keeps usage stats). Useful for a 'reset demo' button."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM chat_history")
    conn.commit()
    conn.close()