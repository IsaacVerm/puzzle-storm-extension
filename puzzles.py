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
            timestamp INTEGER,
            date TEXT,
            time TEXT,
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
            required_fields = ['id', 'timestamp', 'date', 'time', 'puzzle_rating', 'solved', 'time_taken']
            if not all(field in puzzle for field in required_fields):
                return jsonify({"error": f"Missing required fields in puzzle data: {puzzle}"}), 400
            
            cursor.execute('''
            INSERT INTO puzzles (id, timestamp, date, time, puzzle_rating, solved, time_taken)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                puzzle['id'], 
                puzzle['timestamp'],
                puzzle['date'],
                puzzle['time'], 
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
    """Fetch puzzles from the database with optional filters"""
    try:
        # Get query parameters
        n = request.args.get('n', default=10, type=int)
        solved = request.args.get('solved', default=None, type=int)
        
        # Connect to database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Build the query
        query = "SELECT * FROM puzzles"
        params = []
        
        # Add solved filter if specified
        if solved is not None:
            query += " WHERE solved = ?"
            params.append(solved)
        
        # Add random ordering and limit
        query += " ORDER BY RANDOM() LIMIT ?"
        params.append(n)
        
        # Execute query
        cursor.execute(query, params)
        puzzles = cursor.fetchall()
        
        # Convert to list of dictionaries
        column_names = ['id', 'session_id', 'puzzle_rating', 'solved', 'time_taken']
        result = [dict(zip(column_names, puzzle)) for puzzle in puzzles]
        
        conn.close()
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)