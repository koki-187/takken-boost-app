import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models.user import db
from src.models.question import Question
from src.main import app

def init_database():
    """データベースを初期化し、サンプルデータを投入する"""
    with app.app_context():
        # テーブルを作成
        db.create_all()
        
        # 既存のデータをクリア
        Question.query.delete()
        
        # サンプル質問データ
        sample_questions = [
            {
                "category": "権利関係",
                "question_text": "Aが所有する甲土地について、Bが時効により所有権を取得した場合に関する次の記述のうち、民法の規定によれば、正しいものはどれか。",
                "correct_answer": "1",
                "explanation": "時効による所有権の取得は、占有開始時に遡って効力を生ずる。",
                "time_period": "morning"
            },
            {
                "category": "法令上の制限",
                "question_text": "都市計画法に関する次の記述のうち、正しいものはどれか。",
                "correct_answer": "2",
                "explanation": "市街化区域は、すでに市街地を形成している区域及びおおむね10年以内に優先的かつ計画的に市街化を図るべき区域をいう。",
                "time_period": "morning"
            },
            {
                "category": "税・その他",
                "question_text": "不動産取得税に関する次の記述のうち、正しいものはどれか。",
                "correct_answer": "3",
                "explanation": "不動産取得税は、不動産の取得に対して課される税金で、相続による取得は非課税である。",
                "time_period": "afternoon"
            },
            {
                "category": "宅建業法",
                "question_text": "宅地建物取引業法に関する次の記述のうち、正しいものはどれか。",
                "correct_answer": "4",
                "explanation": "宅地建物取引業者は、取引の相手方等に対して、重要事項の説明を行わなければならない。",
                "time_period": "afternoon"
            },
            {
                "category": "5問免除科目",
                "question_text": "住宅金融支援機構に関する次の記述のうち、正しいものはどれか。",
                "correct_answer": "1",
                "explanation": "住宅金融支援機構は、住宅の建設等に必要な資金の融通を支援することを目的とする独立行政法人である。",
                "time_period": "afternoon"
            }
        ]
        
        # データベースに挿入
        for question_data in sample_questions:
            question = Question(
                category=question_data["category"],
                question_text=question_data["question_text"],
                correct_answer=question_data["correct_answer"],
                explanation=question_data["explanation"],
                time_period=question_data["time_period"]
            )
            db.session.add(question)
        
        db.session.commit()
        print("データベースの初期化が完了しました。")
        print(f"サンプル質問データ {len(sample_questions)} 件を投入しました。")

if __name__ == '__main__':
    init_database()

