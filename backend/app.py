import datetime
import json
import os
import re
from collections import Counter
from functools import wraps

from dotenv import load_dotenv
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
# from google import genai
from google.genai import types
from werkzeug.security import check_password_hash, generate_password_hash

load_dotenv()

app = Flask(__name__, static_folder="dist", static_url_path="/")
app.secret_key = os.getenv("SECRET_KEY", "carbonwise-dev-secret")

database_url = os.getenv("DATABASE_URL")
if not database_url:
    db_user = os.environ.get('DB_USER')
    db_pass = os.environ.get('DB_PASS')
    db_host = os.environ.get('DB_HOST')
    db_name = os.environ.get('DB_NAME')
    if db_user and db_pass and db_host and db_name:
        database_url = f"mysql+pymysql://{db_user}:{db_pass}@{db_host}/{db_name}"
    else:
        database_url = "sqlite:///carbonwise.db"

app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True

CORS(
    app, 
    resources={r"/*": {"origins": ["https://carbon-wise-c4jqh2l8l-shruti-bhundes-projects.vercel.app/", "http://localhost:5173"]}},
    supports_credentials=True
)
db = SQLAlchemy(app)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    name = db.Column(db.String(120), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    points = db.Column(db.Integer, default=0)
    streak = db.Column(db.Integer, default=0)
    streak_last_date = db.Column(db.String(10), nullable=True)
    login_count = db.Column(db.Integer, default=0)
    last_login_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)


class AssessmentProfile(db.Model):
    __tablename__ = "assessment_profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    answers = db.Column(db.JSON, nullable=False)
    analysis = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)


class DailyQuest(db.Model):
    __tablename__ = "daily_quests"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    quest_key = db.Column(db.String(80), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    difficulty = db.Column(db.String(50), nullable=False)
    carbon_savings = db.Column(db.Float, nullable=False)
    points = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    generated_date = db.Column(db.String(10), nullable=False, index=True)
    completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime, nullable=True)


class History(db.Model):
    __tablename__ = "quest_history"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    points = db.Column(db.Integer, nullable=False)
    carbon_saved = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    date = db.Column(db.DateTime, default=datetime.datetime.utcnow)


class Report(db.Model):
    __tablename__ = "reports"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    summary_title = db.Column(db.String(255), nullable=False)
    report_body = db.Column(db.Text, nullable=False)
    metrics = db.Column(db.JSON, nullable=True)
    next_steps = db.Column(db.JSON, nullable=True)
    generated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)


class ConversationMessage(db.Model):
    __tablename__ = "conversation_messages"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    role = db.Column(db.String(20), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)


with app.app_context():
    db.create_all()


api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None


def current_date_string():
    return datetime.date.today().isoformat()


def parse_iso_date(value):
    if not value:
        return None
    try:
        return datetime.date.fromisoformat(value)
    except ValueError:
        return None


def today_and_yesterday():
    today = datetime.date.today()
    return today, today - datetime.timedelta(days=1)


def require_session_user(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401

        user = db.session.get(User, user_id)
        if not user:
            session.pop("user_id", None)
            return jsonify({"error": "Unauthorized"}), 401
        return func(user, *args, **kwargs)

    return wrapper


def call_gemini_json(prompt, system_instruction=None):
    if not client:
        raise RuntimeError("Gemini API key is not configured")

    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        temperature=0.2,
    )
    if system_instruction:
        config.system_instruction = system_instruction

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=config,
    )
    return json.loads(response.text)


def clamp(value, minimum, maximum):
    return max(minimum, min(maximum, value))


def calculate_profile_score(answers):
    score = 55

    transport_mode = answers.get("transport_mode", "public_transit")
    daily_distance = normalize_number(answers.get("daily_distance"), 0)
    diet = answers.get("diet", "mixed")
    ac_hours = normalize_number(answers.get("ac_hours"), 0)
    energy_level = answers.get("energy_level", "moderate")
    shopping_frequency = answers.get("shopping_frequency", "monthly")
    plastic_usage = answers.get("plastic_usage", "occasional")

    if transport_mode in {"bicycle_walk", "public_transit"}:
        score += 18
    elif transport_mode == "electric_car":
        score += 10
    elif transport_mode == "motorbike":
        score -= 8
    else:
        score -= 14

    if daily_distance >= 25:
        score -= 8
    elif daily_distance <= 5:
        score += 6

    if diet == "vegan":
        score += 12
    elif diet == "vegetarian":
        score += 7
    elif diet == "heavy_meat":
        score -= 12

    if energy_level == "low":
        score += 10
    elif energy_level == "high":
        score -= 10

    if ac_hours >= 8:
        score -= 6
    elif ac_hours <= 2:
        score += 4

    if shopping_frequency == "rarely":
        score += 5
    elif shopping_frequency == "weekly":
        score -= 5

    if plastic_usage == "zero":
        score += 5
    elif plastic_usage == "regular":
        score -= 5

    return clamp(score, 10, 92)


def normalize_number(value, default):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def stringify_value(value):
    if isinstance(value, (str, int, float)):
        return str(value)
    if isinstance(value, dict):
        title = value.get("title")
        description = value.get("description")
        if title and description:
            return f"{title}: {description}"
        if title:
            return str(title)
        if description:
            return str(description)
    return json.dumps(value, ensure_ascii=False)


def normalize_text_list(values):
    if not isinstance(values, list):
        return []
    return [stringify_value(item) for item in values[:3] if item is not None]


def normalize_report_payload(payload, analysis, history, streak=0):
    payload = payload if isinstance(payload, dict) else {}
    fallback = fallback_report(analysis, history)
    metrics = payload.get("metrics")
    if not isinstance(metrics, dict):
        metrics = {
            "totalCarbonSaved": round(sum(entry.carbon_saved for entry in history), 2),
            "currentScore": analysis.get("score", 0),
            "streak": streak,
        }
    metrics = {
        key: value
        for key, value in metrics.items()
        if key not in {"footprintBreakdown", "breakdown"}
    }

    return {
        "summaryTitle": stringify_value(payload.get("summaryTitle", fallback["summaryTitle"])),
        "reportBody": stringify_value(payload.get("reportBody", fallback["reportBody"])),
        "metrics": metrics,
        "nextSteps": normalize_text_list(payload.get("nextSteps", fallback["nextSteps"])),
    }


def fallback_analysis(answers):
    score = calculate_profile_score(answers)
    transport = answers.get("transport_mode", "public_transit")
    diet = answers.get("diet", "mixed")
    energy = answers.get("energy_level", "moderate")
    shopping = answers.get("shopping_frequency", "monthly")
    plastic = answers.get("plastic_usage", "occasional")
    breakdown = {
        "transport": 42 if transport in {"petrol_car", "motorbike"} else 28,
        "energy": 27 if energy == "high" else 22,
        "food": 22 if diet == "heavy_meat" else 18,
        "consumption": 100,
    }
    total = sum(breakdown.values())
    breakdown = {key: round(value * 100 / total) for key, value in breakdown.items()}
    difference = 100 - sum(breakdown.values())
    if difference:
        breakdown["transport"] += difference

    category = "Low Impact" if score >= 80 else "Moderate Impact" if score >= 60 else "High Impact"
    comparison = "Better than 72% of users" if score >= 80 else "Better than 48% of users" if score >= 60 else "Better than 24% of users"

    return {
        "baseScore": score,
        "score": score,
        "category": category,
        "comparison": comparison,
        "breakdown": breakdown,
        "report": "Your assessment is saved, and your dashboard will now track your footprint, quests, and streaks from the database.",
        "recommendations": [
            {"title": "Swap one commute", "description": "Use public transport, walking, or cycling for one regular trip this week.", "category": "transport"},
            {"title": "One plant-forward meal", "description": "Replace one meat-heavy meal with a plant-based option to lower food emissions.", "category": "food"},
            {"title": "Power-down routine", "description": "Turn off idle lights and devices before sleeping to trim home energy use.", "category": "energy"},
        ],
    }


def normalize_analysis(raw_analysis, answers):
    analysis = raw_analysis if isinstance(raw_analysis, dict) else {}
    fallback = fallback_analysis(answers)
    calculated_score = calculate_profile_score(answers)

    score = analysis.get("score", fallback["score"])
    try:
        score = int(round(float(score)))
    except (TypeError, ValueError):
        score = calculated_score

    if score < 10 or score > 92:
        score = calculated_score

    breakdown = analysis.get("breakdown") or fallback["breakdown"]
    if not isinstance(breakdown, dict):
        breakdown = fallback["breakdown"]

    cleaned_breakdown = {
        "transport": int(round(normalize_number(breakdown.get("transport"), fallback["breakdown"]["transport"]))),
        "energy": int(round(normalize_number(breakdown.get("energy"), fallback["breakdown"]["energy"]))),
        "food": int(round(normalize_number(breakdown.get("food"), fallback["breakdown"]["food"]))),
        "consumption": int(round(normalize_number(breakdown.get("consumption"), fallback["breakdown"]["consumption"]))),
    }
    total = sum(cleaned_breakdown.values()) or 100
    if total != 100:
        difference = 100 - total
        cleaned_breakdown["transport"] = clamp(cleaned_breakdown["transport"] + difference, 0, 100)

    recommendations = analysis.get("recommendations") or fallback["recommendations"]
    if not isinstance(recommendations, list):
        recommendations = fallback["recommendations"]

    cleaned_recommendations = []
    for item in recommendations[:3]:
        if not isinstance(item, dict):
            continue
        cleaned_recommendations.append(
            {
                "title": item.get("title", "Eco Step"),
                "description": item.get("description", "A small sustainable habit to try next."),
                "category": item.get("category", "general"),
            }
        )

    if not cleaned_recommendations:
        cleaned_recommendations = fallback["recommendations"]

    return {
        "baseScore": calculated_score,
        "score": clamp(score, 10, 92),
        "category": analysis.get("category", fallback["category"]),
        "comparison": analysis.get("comparison", fallback["comparison"]),
        "breakdown": cleaned_breakdown,
        "report": analysis.get("report", fallback["report"]),
        "recommendations": cleaned_recommendations,
    }


def fallback_quests(analysis):
    score = analysis.get("score", 60)
    return [
        {
            "id": "quest_transport",
            "title": "Take a low-carbon commute",
            "description": "Walk, cycle, carpool, or use public transport for one trip today.",
            "difficulty": "Easy" if score >= 70 else "Medium",
            "carbonSavings": 2.5,
            "points": 40,
            "category": "transport",
        },
        {
            "id": "quest_food",
            "title": "Choose a plant-first meal",
            "description": "Make one meal today meat-free or mostly plant-based.",
            "difficulty": "Easy",
            "carbonSavings": 1.8,
            "points": 35,
            "category": "food",
        },
        {
            "id": "quest_energy",
            "title": "Cut standby power",
            "description": "Switch off devices, lights, and chargers before sleep.",
            "difficulty": "Easy" if score >= 80 else "Medium",
            "carbonSavings": 1.2,
            "points": 30,
            "category": "energy",
        },
    ]


def normalize_quest(item, index):
    quest = item if isinstance(item, dict) else {}
    return {
        "id": str(quest.get("id") or quest.get("questId") or f"quest_{index + 1}"),
        "title": quest.get("title", f"Eco Quest {index + 1}"),
        "description": quest.get("description", "Take one practical action to lower your footprint."),
        "difficulty": quest.get("difficulty", "Medium"),
        "carbonSavings": normalize_number(quest.get("carbonSavings"), 1.0),
        "points": int(round(normalize_number(quest.get("points"), 25))),
        "category": quest.get("category", "general"),
    }


def fallback_report(analysis, history):
    total_saved = round(sum(entry.carbon_saved for entry in history), 2)
    return {
        "summaryTitle": "Your Carbon Journey Is Taking Shape",
        "reportBody": f"You have saved about {total_saved} kg CO₂ so far. Keep going with small, repeatable habits that build into a stronger streak and a lower footprint.",
        "metrics": {
            "totalCarbonSaved": total_saved,
            "currentScore": analysis.get("score", 0),
        },
        "nextSteps": [
            "Keep finishing today's quests to protect your streak.",
            "Use the chatbot to compare your habits against your saved reports.",
            "Review the dashboard breakdown before planning your next change.",
        ],
    }


def normalize_chat_answer(answer, retrieved):
    answer_text = stringify_value(answer).strip()
    if not answer_text:
        answer_text = "I’m not seeing enough saved context yet, but your report, quests, and streak are all stored and ready to use."

    if answer_text.startswith("{") or answer_text.startswith("["):
        answer_text = "I checked your saved report context and quests. " + answer_text[:180]

    if "i pulled the most relevant saved carbonwise context" in answer_text.lower():
        summary_bits = [content for _, content in retrieved[:3] if content]
        short_summary = " | ".join(bit[:120] for bit in summary_bits)
        if short_summary:
            answer_text = f"Here’s the most relevant context I found: {short_summary}"

    return answer_text


def build_contextual_answer(user, retrieved):
    assessment = get_assessment(user.id)
    latest_report = get_latest_report(user)
    analysis = assessment.analysis if assessment and isinstance(assessment.analysis, dict) else {}
    top_next_steps = normalize_text_list(latest_report.next_steps if latest_report and latest_report.next_steps else [])
    if not top_next_steps and analysis.get("recommendations"):
        top_next_steps = [
            stringify_value(item) for item in analysis.get("recommendations", [])[:3]
        ]

    if top_next_steps:
        lead = "Here’s the clearest thing to work on this week:"
        return lead + " " + " ".join(f"{index + 1}. {step}" for index, step in enumerate(top_next_steps[:3]))

    score = analysis.get("score")
    category = analysis.get("category", "your current footprint")
    if score is not None:
        return f"Your latest carbon index is {score}, and your current profile is {category}. Focus on the daily quests to keep improving."

    summary_bits = [content for _, content in retrieved[:3] if content]
    if summary_bits:
        return "I found these relevant notes: " + " ".join(summary_bits[:2])

    return "I’m not seeing enough saved context yet, but your profile, quests, and report are all stored and ready to use."


def get_assessment(user_id):
    return AssessmentProfile.query.filter_by(user_id=user_id).first()


def get_today_quests(user_id):
    return DailyQuest.query.filter_by(user_id=user_id, generated_date=current_date_string()).order_by(DailyQuest.id.asc()).all()


def generate_profile_analysis(answers):
    system_instruction = (
        "You are CarbonWise's assessment engine. "
        "Analyze the submitted lifestyle answers and return JSON with these keys: "
        "score, category, comparison, breakdown, report, recommendations, and baseScore. "
        "Breakdown must include transport, energy, food, and consumption and sum to 100. "
        "Recommendations must be a list of exactly 3 actionable items with title, description, and category."
    )
    prompt = f"Analyze this user assessment:\n{json.dumps(answers, indent=2)}"
    try:
        return normalize_analysis(call_gemini_json(prompt, system_instruction), answers)
    except Exception:
        return fallback_analysis(answers)


def generate_quest_payloads(answers, analysis):
    system_instruction = (
        "You are CarbonWise's daily quest engine. "
        "Return JSON as either a list of 3 quests or an object with a challenges array. "
        "Each quest must include id, title, description, difficulty, carbonSavings, points, and category. "
        "The quests should be personalized, practical, and mutually distinct."
    )
    prompt = f"Create 3 daily quests using this assessment and analysis:\n{json.dumps({'answers': answers, 'analysis': analysis}, indent=2)}"
    try:
        raw = call_gemini_json(prompt, system_instruction)
        quests = raw.get("challenges", raw) if isinstance(raw, dict) else raw
        if not isinstance(quests, list):
            raise ValueError("Quest payload was not a list")
        normalized = [normalize_quest(item, index) for index, item in enumerate(quests[:3])]
        return normalized if len(normalized) == 3 else fallback_quests(analysis)
    except Exception:
        return fallback_quests(analysis)


def store_assessment(user, answers, analysis):
    assessment = AssessmentProfile.query.filter_by(user_id=user.id).first()
    if assessment:
        assessment.answers = answers
        assessment.analysis = analysis
    else:
        assessment = AssessmentProfile(user_id=user.id, answers=answers, analysis=analysis)
        db.session.add(assessment)
    db.session.commit()
    return assessment


def ensure_daily_quests(user):
    today = current_date_string()
    quests = get_today_quests(user.id)
    if quests:
        return quests

    assessment = get_assessment(user.id)
    answers = assessment.answers if assessment else {}
    analysis = assessment.analysis if assessment else fallback_analysis(answers)
    quest_payloads = generate_quest_payloads(answers, analysis)

    for payload in quest_payloads:
        db.session.add(
            DailyQuest(
                user_id=user.id,
                quest_key=payload["id"],
                title=payload["title"],
                description=payload["description"],
                difficulty=payload["difficulty"],
                carbon_savings=payload["carbonSavings"],
                points=payload["points"],
                category=payload["category"],
                generated_date=today,
            )
        )
    db.session.commit()
    return get_today_quests(user.id)


def mark_missed_days(user):
    today = current_date_string()
    missed_day = DailyQuest.query.filter(
        DailyQuest.user_id == user.id,
        DailyQuest.generated_date < today,
        DailyQuest.completed.is_(False),
    ).first()
    if missed_day:
        user.streak = 0
        user.streak_last_date = None
        db.session.commit()


def update_streak_after_completion(user):
    today = current_date_string()
    today_quests = get_today_quests(user.id)
    if not today_quests:
        return

    if not all(quest.completed for quest in today_quests):
        return

    if user.streak_last_date == today:
        return

    today_date, yesterday = today_and_yesterday()
    last_date = parse_iso_date(user.streak_last_date)
    if last_date == yesterday:
        user.streak = max(1, (user.streak or 0) + 1)
    else:
        user.streak = 1

    user.streak_last_date = today_date.isoformat()
    db.session.commit()


def add_history_entry(user, quest):
    db.session.add(
        History(
            user_id=user.id,
            title=quest.title,
            points=quest.points,
            carbon_saved=quest.carbon_savings,
            category=quest.category,
        )
    )


def get_recent_history(user, limit=8):
    return History.query.filter_by(user_id=user.id).order_by(History.date.desc()).limit(limit).all()


def generate_report_payload(user):
    assessment = get_assessment(user.id)
    analysis = assessment.analysis if assessment else fallback_analysis({})
    history = get_recent_history(user, limit=12)
    total_carbon_saved = round(sum(entry.carbon_saved for entry in history), 2)
    total_points = user.points

    system_instruction = (
        "You are CarbonWise's report writer. "
        "Return JSON with summaryTitle, reportBody, metrics, and nextSteps. "
        "The report should be concise, practical, and focused on carbon footprint improvement."
    )
    prompt = json.dumps(
        {
            "user": {"name": user.name, "points": total_points, "streak": user.streak},
            "analysis": analysis,
            "history": [
                {
                    "title": item.title,
                    "points": item.points,
                    "carbon_saved": item.carbon_saved,
                    "category": item.category,
                }
                for item in history[:8]
            ],
            "total_carbon_saved": total_carbon_saved,
        },
        indent=2,
    )

    try:
        raw = call_gemini_json(prompt, system_instruction)
        return normalize_report_payload(raw, analysis, history, user.streak)
    except Exception:
        return fallback_report(analysis, history)


def get_latest_report(user):
    return Report.query.filter_by(user_id=user.id).order_by(Report.generated_at.desc()).first()


def save_report(user, payload):
    normalized = normalize_report_payload(payload, get_assessment(user.id).analysis if get_assessment(user.id) else fallback_analysis({}), get_recent_history(user, limit=12), user.streak)
    report = Report(
        user_id=user.id,
        summary_title=normalized["summaryTitle"],
        report_body=normalized["reportBody"],
        metrics=normalized["metrics"],
        next_steps=normalized["nextSteps"],
    )
    db.session.add(report)
    db.session.commit()
    return report


def maybe_generate_report(user):
    latest = get_latest_report(user)
    if latest:
        return latest
    return save_report(user, generate_report_payload(user))


def keyword_score(text, words):
    lowered = text.lower()
    return sum(lowered.count(word) for word in words)


def retrieve_chat_context(user, question):
    tokens = [token for token in re.findall(r"[a-zA-Z0-9]+", question.lower()) if len(token) > 2]
    records = []

    assessment = get_assessment(user.id)
    if assessment:
        analysis = assessment.analysis if isinstance(assessment.analysis, dict) else {}
        answers = assessment.answers if isinstance(assessment.answers, dict) else {}
        records.append((
            "assessment",
            f"Score {analysis.get('score', 'unknown')}, category {analysis.get('category', 'unknown')}, comparison {analysis.get('comparison', 'unknown')}.",
        ))
        records.append((
            "answers",
            f"Transport: {answers.get('transport_mode', 'unknown')}; diet: {answers.get('diet', 'unknown')}; energy level: {answers.get('energy_level', 'unknown')}; shopping: {answers.get('shopping_frequency', 'unknown')}; plastic use: {answers.get('plastic_usage', 'unknown')}.",
        ))

    latest_report = get_latest_report(user)
    if latest_report:
        next_steps = latest_report.next_steps or []
        next_steps_text = " ".join(normalize_text_list(next_steps))
        records.append(("report", f"{latest_report.summary_title}. {stringify_value(latest_report.report_body)}. {next_steps_text}"))

    for quest in get_today_quests(user.id):
        records.append(("quest", f"{quest.title} {quest.description} {quest.category}"))

    for entry in get_recent_history(user, limit=10):
        records.append(("history", f"{entry.title} {entry.category} {entry.points} {entry.carbon_saved}"))

    for message in ConversationMessage.query.filter_by(user_id=user.id).order_by(ConversationMessage.created_at.desc()).limit(6):
        records.append(("memory", message.content))

    ranked = sorted(
        records,
        key=lambda item: keyword_score(item[1], tokens),
        reverse=True,
    )
    return ranked[:5]


def generate_chat_reply(user, question):
    memory = ConversationMessage.query.filter_by(user_id=user.id).order_by(ConversationMessage.created_at.asc()).limit(12).all()
    retrieved = retrieve_chat_context(user, question)
    system_instruction = (
        "You are CarbonWise's conversational memory assistant. "
        "Answer the user's question using the retrieved context and prior conversation memory. "
        "Stay focused on carbon footprinting, the user's report, streaks, badges, quests, and progress. "
        "Return JSON with answer and sources, but the answer field must be plain natural language only. "
        "Do not include raw JSON, code, or database keys in the answer."
    )
    prompt = json.dumps(
        {
            "question": question,
            "memory": [{"role": item.role, "content": item.content} for item in memory],
            "retrieved_context": [{"label": label, "content": content} for label, content in retrieved],
        },
        indent=2,
    )

    try:
        raw = call_gemini_json(prompt, system_instruction)
        answer = raw.get("answer") if isinstance(raw, dict) else None
        sources = raw.get("sources") if isinstance(raw, dict) else None
        if not answer:
            raise ValueError("Missing answer")
        answer_text = normalize_chat_answer(answer, retrieved)
        if "{" in answer_text or "}" in answer_text or "footprintBreakdown" in answer_text:
            answer_text = build_contextual_answer(user, retrieved)
        return {
            "answer": answer_text,
            "sources": sources if isinstance(sources, list) else [label for label, _ in retrieved],
        }
    except Exception:
        summary = build_contextual_answer(user, retrieved)
        return {
            "answer": summary,
            "sources": [label for label, _ in retrieved],
        }


def serialize_chat_messages(user, limit=30):
    messages = ConversationMessage.query.filter_by(user_id=user.id).order_by(ConversationMessage.created_at.asc()).limit(limit).all()
    return [
        {
            "id": item.id,
            "role": item.role,
            "content": item.content,
            "createdAt": item.created_at.isoformat(),
        }
        for item in messages
    ]


def compute_badges(user):
    assessment = get_assessment(user.id)
    history = get_recent_history(user, limit=100)
    total_saved = sum(entry.carbon_saved for entry in history)
    completed_quests = DailyQuest.query.filter_by(user_id=user.id, completed=True).count()
    today_quests = DailyQuest.query.filter_by(user_id=user.id, generated_date=current_date_string()).all()
    today_completed = sum(1 for quest in today_quests if quest.completed)
    score = assessment.analysis.get("score", 0) if assessment and isinstance(assessment.analysis, dict) else 0
    streak = user.streak or 0

    badge_catalog = [
        {
            "id": "eco_starter",
            "name": "Eco Starter",
            "desc": "Complete your first eco-quest.",
            "icon": "Sparkles",
            "unlocked": completed_quests >= 1,
        },
        {
            "id": "green_explorer",
            "name": "Green Explorer",
            "desc": "Complete 5 daily quests.",
            "icon": "Compass",
            "unlocked": completed_quests >= 5,
        },
        {
            "id": "carbon_hero",
            "name": "Carbon Hero",
            "desc": "Complete 15 quests.",
            "icon": "Shield",
            "unlocked": completed_quests >= 15,
        },
        {
            "id": "planet_protector",
            "name": "Planet Protector",
            "desc": "Save 50 kg CO₂.",
            "icon": "Heart",
            "unlocked": total_saved >= 50,
        },
        {
            "id": "streak_sprinter",
            "name": "Streak Sprinter",
            "desc": "Hold a 3-day streak.",
            "icon": "Flame",
            "unlocked": streak >= 3,
        },
        {
            "id": "streak_guardian",
            "name": "Streak Guardian",
            "desc": "Hold a 7-day streak.",
            "icon": "ShieldCheck",
            "unlocked": streak >= 7,
        },
        {
            "id": "low_impact_legend",
            "name": "Low Impact Legend",
            "desc": "Reach a score of 80 or more.",
            "icon": "Leaf",
            "unlocked": score >= 80,
        },
        {
            "id": "quest_collector",
            "name": "Quest Collector",
            "desc": "Finish every quest in a day.",
            "icon": "Award",
            "unlocked": len(today_quests) == 3 and today_completed == 3,
        },
        {
            "id": "report_reader",
            "name": "Report Reader",
            "desc": "Generate or open your latest report.",
            "icon": "Globe2",
            "unlocked": Report.query.filter_by(user_id=user.id).count() > 0,
        },
        {
            "id": "growth_keeper",
            "name": "Growth Keeper",
            "desc": "Log in again and keep your data synced.",
            "icon": "Sprout",
            "unlocked": (user.login_count or 0) >= 2,
        },
    ]

    return badge_catalog


def serialize_user_payload(user):
    assessment = get_assessment(user.id)
    if assessment and isinstance(assessment.analysis, dict):
        corrected_analysis = normalize_analysis(assessment.analysis, assessment.answers or {})
        if corrected_analysis.get("score") != assessment.analysis.get("score"):
            assessment.analysis = corrected_analysis
            db.session.commit()
        elif corrected_analysis.get("baseScore") != assessment.analysis.get("baseScore"):
            assessment.analysis = corrected_analysis
            db.session.commit()
    today_quests = ensure_daily_quests(user)
    latest_report = maybe_generate_report(user)
    history = get_recent_history(user)
    badges = compute_badges(user)

    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "points": user.points,
            "streak": user.streak,
            "streak_last_date": user.streak_last_date,
        },
        "badgeCount": sum(1 for badge in badges if badge["unlocked"]),
        "assessment": {
            "answers": assessment.answers if assessment else {},
            "analysis": assessment.analysis if assessment else fallback_analysis({}),
        },
        "quests": [
            {
                "id": quest.id,
                "questKey": quest.quest_key,
                "title": quest.title,
                "description": quest.description,
                "difficulty": quest.difficulty,
                "carbonSavings": quest.carbon_savings,
                "points": quest.points,
                "category": quest.category,
                "generatedDate": quest.generated_date,
                "completed": quest.completed,
                "completedAt": quest.completed_at.isoformat() if quest.completed_at else None,
            }
            for quest in today_quests
        ],
        "report": {
            "id": latest_report.id,
            "summaryTitle": latest_report.summary_title,
            "reportBody": stringify_value(latest_report.report_body),
            "metrics": latest_report.metrics or {},
            "nextSteps": normalize_text_list(latest_report.next_steps or []),
            "generatedAt": latest_report.generated_at.isoformat(),
        },
        "history": [
            {
                "id": item.id,
                "title": item.title,
                "points": item.points,
                "carbonSaved": item.carbon_saved,
                "category": item.category,
                "date": item.date.isoformat(),
                "displayDate": item.date.strftime("%b %d"),
            }
            for item in history
        ],
        "badges": badges,
    }


def build_register_answers(data):
    return {
        "transport_mode": data.get("transport_mode", "public_transit"),
        "daily_distance": data.get("daily_distance", ""),
        "diet": data.get("diet", "mixed"),
        "ac_hours": data.get("ac_hours", ""),
        "energy_level": data.get("energy_level", "moderate"),
        "shopping_frequency": data.get("shopping_frequency", "monthly"),
        "plastic_usage": data.get("plastic_usage", "occasional"),
    }


@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    answers = build_register_answers(data)

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account already exists for this email"}), 409

    analysis = generate_profile_analysis(answers)
    user = User(email=email, name=name, password_hash=generate_password_hash(password))
    db.session.add(user)
    db.session.flush()
    store_assessment(user, answers, analysis)

    user.points = 0
    user.streak = 0
    user.streak_last_date = None
    user.login_count = 1
    user.last_login_at = datetime.datetime.utcnow()
    db.session.commit()

    session["user_id"] = user.id
    ensure_daily_quests(user)
    maybe_generate_report(user)
    db.session.refresh(user)

    return jsonify(serialize_user_payload(user))


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    session["user_id"] = user.id
    user.login_count = (user.login_count or 0) + 1
    user.last_login_at = datetime.datetime.utcnow()
    mark_missed_days(user)
    db.session.commit()
    return jsonify(serialize_user_payload(user))


@app.route("/api/auth/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    return jsonify({"status": "ok"})


@app.route("/api/auth/me", methods=["GET"])
@require_session_user
def me(user):
    mark_missed_days(user)
    db.session.commit()
    return jsonify(serialize_user_payload(user))


@app.route("/api/dashboard", methods=["GET"])
@require_session_user
def dashboard(user):
    mark_missed_days(user)
    db.session.commit()
    return jsonify(serialize_user_payload(user))


@app.route("/api/quests/today", methods=["GET"])
@require_session_user
def today_quests(user):
    mark_missed_days(user)
    db.session.commit()
    return jsonify(serialize_user_payload(user)["quests"])


@app.route("/api/quests/<int:quest_id>/complete", methods=["POST"])
@require_session_user
def complete_quest(user, quest_id):
    quest = DailyQuest.query.filter_by(id=quest_id, user_id=user.id).first()
    if not quest:
        return jsonify({"error": "Quest not found"}), 404
    if quest.completed:
        return jsonify(serialize_user_payload(user))

    quest.completed = True
    quest.completed_at = datetime.datetime.utcnow()
    user.points = (user.points or 0) + quest.points
    add_history_entry(user, quest)
    db.session.commit()

    update_streak_after_completion(user)
    db.session.commit()
    return jsonify(serialize_user_payload(user))


@app.route("/api/reports/latest", methods=["GET"])
@require_session_user
def latest_report(user):
    mark_missed_days(user)
    db.session.commit()
    report = maybe_generate_report(user)
    return jsonify(
        {
            "summaryTitle": report.summary_title,
            "reportBody": stringify_value(report.report_body),
            "metrics": report.metrics or {},
            "nextSteps": normalize_text_list(report.next_steps or []),
            "generatedAt": report.generated_at.isoformat(),
        }
    )


@app.route("/api/reports/generate", methods=["POST"])
@require_session_user
def generate_report(user):
    payload = generate_report_payload(user)
    report = save_report(user, payload)
    return jsonify(
        {
            "summaryTitle": report.summary_title,
            "reportBody": stringify_value(report.report_body),
            "metrics": report.metrics or {},
            "nextSteps": normalize_text_list(report.next_steps or []),
            "generatedAt": report.generated_at.isoformat(),
        }
    )


@app.route("/api/badges", methods=["GET"])
@require_session_user
def badges(user):
    mark_missed_days(user)
    db.session.commit()
    return jsonify(compute_badges(user))


@app.route("/api/chat", methods=["POST"])
@require_session_user
def chat(user):
    from google import genai
    from google.genai import types
    data = request.json or {}
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "Message is required"}), 400

    db.session.add(ConversationMessage(user_id=user.id, role="user", content=message))
    db.session.commit()
    reply = generate_chat_reply(user, message)
    db.session.add(ConversationMessage(user_id=user.id, role="assistant", content=reply["answer"]))
    db.session.commit()
    return jsonify(reply)


@app.route("/api/chat/history", methods=["GET"])
@require_session_user
def chat_history(user):
    return jsonify(serialize_chat_messages(user))


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"}), 200


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    static_path = os.path.join(app.static_folder, path)
    if path and os.path.exists(static_path):
        return app.send_static_file(path)
    return app.send_static_file("index.html")


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
