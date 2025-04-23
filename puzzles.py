from flask import Flask, request, jsonify
import sqlite3
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from the extension

# Database setup
DB_PATH = 'puzzles.db'

def init_db():
    """Initialize the database if it doesn't exist"""
    if not os.path.exists(DB_PATH):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
        CREATE TABLE puzzles (
            id TEXT,
            session_id TEXT,
            puzzle_rating INTEGER,
            solved INTEGER,
            time_taken INTEGER
        )
        ''')
        conn.commit()
        conn.close()
        print("Database initialized")

init_db()

@app.route('/puzzles', methods=['POST'])
def save_puzzles():
    """Save puzzle data to the database"""
    try:
        # Get data from request
        data = request.json
        
        if not data or not isinstance(data, list):
            return jsonify({"error": "Invalid data format. Expected a list of puzzles."}), 400
        
        # Connect to database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Insert each puzzle
        for puzzle in data:
            # Validate required fields
            required_fields = ['id', 'session_id', 'puzzle_rating', 'solved', 'time_taken']
            if not all(field in puzzle for field in required_fields):
                return jsonify({"error": f"Missing required fields in puzzle data: {puzzle}"}), 400
            
            cursor.execute('''
            INSERT INTO puzzles (id, session_id, puzzle_rating, solved, time_taken)
            VALUES (?, ?, ?, ?, ?)
            ''', (
                puzzle['id'], 
                puzzle['session_id'], 
                puzzle['puzzle_rating'], 
                puzzle['solved'], 
                puzzle['time_taken']
            ))
        
        conn.commit()
        conn.close()
        
        return jsonify({"message": f"Successfully saved {len(data)} puzzles"}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/puzzles', methods=['GET'])
def get_puzzles():
    """Get all puzzles from the database"""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row  # Return rows as dictionaries
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM puzzles')
        puzzles = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        return jsonify(puzzles), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)