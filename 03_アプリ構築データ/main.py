
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
CORS(app)

# データベースファイルのパスを修正
basedir = os.path.abspath(os.path.dirname(__file__))
instance_path = os.path.join(basedir, "..", "instance")

# instanceディレクトリが存在しない場合は作成
if not os.path.exists(instance_path):
    os.makedirs(instance_path)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(instance_path, "site.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(50), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    correct_answer = db.Column(db.String(1), nullable=False)
    explanation = db.Column(db.Text, nullable=False)
    time_of_day = db.Column(db.String(10), nullable=False) # 'morning', 'noon', 'night'

    def __repr__(self):
        return f"Question('{self.category}', '{self.question_text}')"

    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'question_text': self.question_text,
            'correct_answer': self.correct_answer,
            'explanation': self.explanation,
            'time_of_day': self.time_of_day
        }

@app.route("/")
def hello_world():
    return "Hello, Takken BOOST Backend!"

@app.route("/questions", methods=["GET"])
def get_questions():
    questions = Question.query.all()
    return jsonify([q.to_dict() for q in questions])

@app.route("/questions", methods=["POST"])
def add_question():
    data = request.get_json()
    new_question = Question(
        category=data["category"],
        question_text=data["question_text"],
        correct_answer=data["correct_answer"],
        explanation=data["explanation"],
        time_of_day=data["time_of_day"]
    )
    db.session.add(new_question)
    db.session.commit()
    return jsonify(new_question.to_dict()), 201

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, host="0.0.0.0")


