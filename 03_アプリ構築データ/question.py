
from ..main import db

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(50), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    correct_answer = db.Column(db.String(1), nullable=False)
    explanation = db.Column(db.Text, nullable=False)
    time_of_day = db.Column(db.String(10), nullable=False) # 'morning', 'noon', 'night'

    def __repr__(self):
        return f"Question(\\'{self.category}\\, \'{self.question_text}\\'")"

    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'question_text': self.question_text,
            'correct_answer': self.correct_answer,
            'explanation': self.explanation,
            'time_of_day': self.time_of_day
        }


