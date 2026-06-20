import os
import json
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from google import genai
from google.genai import types

load_dotenv()

app = Flask(__name__, static_folder='dist', static_url_path='/')
CORS(app)

# Database Configuration
# In a real scenario, the password and host should be in environment variables
# DB connection string for Cloud SQL
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "password10")
DB_HOST = os.getenv("DB_HOST", "34.123.230.20")
DB_NAME = os.getenv("DB_NAME", "carbonwise_db")

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- Database Models ---

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    points = db.Column(db.Integer, default=0)
    streak = db.Column(db.Integer, default=0)
    streak_last_date = db.Column(db.String(20), nullable=True) # YYYY-MM-DD
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class UserProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    base_score = db.Column(db.Integer, nullable=True)
    score = db.Column(db.Integer, nullable=True)
    category = db.Column(db.String(100), nullable=True)
    comparison = db.Column(db.String(255), nullable=True)
    report = db.Column(db.Text, nullable=True)
    breakdown = db.Column(db.JSON, nullable=True)
    recommendations = db.Column(db.JSON, nullable=True)

class DailyQuest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    quest_id_str = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    difficulty = db.Column(db.String(50), nullable=False)
    carbon_savings = db.Column(db.Float, nullable=False)
    points = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    generated_date = db.Column(db.String(20), nullable=False) # YYYY-MM-DD

class History(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    points = db.Column(db.Integer, nullable=False)
    carbon_saved = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    date = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# Create tables
with app.app_context():
    db.create_all()

# --- Gemini Setup ---

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("WARNING: GEMINI_API_KEY environment variable is not set. AI features may fail.")
client = genai.Client(api_key=api_key) if api_key else None

def call_gemini_json(prompt, system_instruction=None):
    if not client:
        raise Exception("Gemini API key not configured")
    try:
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.2,
        )
        if system_instruction:
            config.system_instruction = system_instruction
            
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=config
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        raise e

# --- Auth Endpoints ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    name = data.get('name')
    if not email or not name:
        return jsonify({"error": "Missing name or email"}), 400
    
    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({"error": "User already exists"}), 400
        
    user = User(email=email, name=name)
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"message": "Success", "user": {"id": user.id, "email": user.email, "name": user.name}})

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "message": "Success",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "points": user.points,
            "streak": user.streak
        }
    })

@app.route('/api/user/sync', methods=['POST'])
def sync_user_data():
    """Endpoint to sync frontend localStorage data to backend, ensuring we keep it simple for migration."""
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Missing email"}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        # Create user if missing during sync
        user = User(email=email, name=data.get('name', 'User'))
        db.session.add(user)
        db.session.commit()
        
    # Sync points and streak
    if 'points' in data:
        user.points = data['points']
    if 'streak' in data:
        user.streak = data['streak']
    if 'streak_last_date' in data:
        user.streak_last_date = data['streak_last_date']
        
    db.session.commit()
    return jsonify({"status": "success"})

# --- Original Endpoints ---

@app.route('/analyze-profile', methods=['POST'])
def analyze_profile():
    data = request.json or {}
    system_instruction = (
        "You are an expert environmental scientist and AI sustainability assistant for CarbonWise. "
        "Analyze the user's lifestyle habits and return a structured JSON response containing: "
        "- score: An integer sustainability score from 0 to 100 (higher means more sustainable/lower carbon footprint). "
        "- category: A brief string descriptive of their footprint level (e.g. 'Low Impact', 'Moderate Impact', 'High Impact'). "
        "- comparison: A brief string highlighting how they compare to the average citizen (e.g., 'Better than 48% of users'). "
        "- breakdown: An object mapping categories to percentage of total footprint: transport, energy, food, consumption. "
        "  These percentages must sum up to exactly 100. "
        "- report: A short markdown field report (2-3 sentences) explaining the key driver and potential improvements. "
        "- recommendations: A list of 3 actionable, highly relevant recommendations to reduce emissions. Each recommendation should have: "
        "  * title: Brief name (e.g., 'Meatless Mondays') "
        "  * description: Short detail of why and how (e.g., 'Swapping beef for plant-based options saves 4.5kg CO2 per meal.') "
        "  * category: 'transport', 'food', 'energy', or 'consumption'. "
    )
    prompt = f"Analyze this user profile:\n{json.dumps(data, indent=2)}"
    
    try:
        analysis_result = call_gemini_json(prompt, system_instruction)
        return jsonify(analysis_result)
    except Exception as e:
        fallback = {
            "score": 62, "category": "Moderate Impact", "comparison": "Better than 45% of users",
            "breakdown": {"transport": 50, "energy": 25, "food": 15, "consumption": 10},
            "report": "Transportation contributes most to your footprint.",
            "recommendations": [{"title": "Eco-commuting", "description": "Walk or cycle.", "category": "transport"}]
        }
        return jsonify(fallback)

@app.route('/generate-challenges', methods=['POST'])
def generate_challenges():
    data = request.json or {}
    system_instruction = (
        "You are the eco-quest gamification engine for CarbonWise. "
        "Generate 3 personalized, highly actionable sustainability challenges. "
        "Return a JSON list of challenge objects. Each MUST have: "
        "- id: string id "
        "- title: Clean title "
        "- description: Instructions "
        "- difficulty: 'Easy', 'Medium', or 'Hard' "
        "- carbonSavings: numeric CO2 saved kg "
        "- points: Reward points "
        "- category: 'transport', 'food', 'energy', or 'consumption' "
    )
    prompt = f"Create 3 personalized quests for this user data:\n{json.dumps(data, indent=2)}"
    try:
        challenges = call_gemini_json(prompt, system_instruction)
        if isinstance(challenges, dict) and "challenges" in challenges:
            challenges = challenges["challenges"]
        return jsonify(challenges)
    except Exception as e:
        fallback = [{"id": "quest_1", "title": "Public Transport", "description": "Take bus", "difficulty": "Medium", "carbonSavings": 8.0, "points": 100, "category": "transport"}]
        return jsonify(fallback)

@app.route('/generate-report', methods=['POST'])
def generate_report():
    data = request.json or {}
    system_instruction = (
        "You are the senior environmental analyst for CarbonWise. "
        "Produce a highly personalized, weekly sustainability report summary. "
        "Return a JSON object containing: "
        "- summaryTitle: A brief engaging headline "
        "- reportBody: 3-4 sentences in markdown summarizing achievements. "
        "- nextWeekGoals: A list of 3 goal descriptions for next week. "
    )
    prompt = f"Analyze the user's progress:\n{json.dumps(data, indent=2)}"
    try:
        report = call_gemini_json(prompt, system_instruction)
        return jsonify(report)
    except Exception as e:
        fallback = {"summaryTitle": "Eco Champion!", "reportBody": "Great job reducing emissions.", "nextWeekGoals": []}
        return jsonify(fallback)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

# --- Frontend Serving ---

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return app.send_static_file(path)
    else:
        return app.send_static_file('index.html')

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
