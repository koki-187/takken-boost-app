// 問題データインポートスクリプト
import fs from 'fs';
import path from 'path';

// 問題データベースファイルを読み込み
const questionsPath = path.join(process.cwd(), '01_試験問題集/questions_database.json');
const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

// SQL INSERT文を生成
function generateInsertSQL(questions: any[]): string {
  const insertStatements = questions.map(q => {
    const options = JSON.stringify(q.options || []);
    const learningPoints = JSON.stringify(q.learning_points || []);
    const questionText = q.question_text.replace(/'/g, "''");
    const explanation = (q.explanation || '').replace(/'/g, "''");
    const tips = (q.tips || '').replace(/'/g, "''");
    
    return `INSERT OR IGNORE INTO questions (
      id, subject, category, difficulty, time_slot, 
      question_text, options, correct_answer, explanation, 
      learning_points, tips, estimated_time
    ) VALUES (
      '${q.id}',
      '${q.subject}',
      '${q.category}',
      '${q.difficulty || 'basic'}',
      ${q.time_slot ? `'${q.time_slot}'` : 'NULL'},
      '${questionText}',
      '${options}',
      ${q.correct_answer},
      '${explanation}',
      '${learningPoints}',
      '${tips}',
      ${q.estimated_time || 180}
    );`;
  });
  
  return insertStatements.join('\n');
}

// 402問のデータを処理
const sqlStatements = generateInsertSQL(questionsData);

// SQLファイルとして出力
const outputPath = path.join(process.cwd(), 'migrations/0003_insert_questions.sql');
fs.writeFileSync(outputPath, `-- 402問の試験問題データ\n${sqlStatements}`);

console.log(`✅ Generated SQL insert statements for ${questionsData.length} questions`);
console.log(`📁 Output file: ${outputPath}`);