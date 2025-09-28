#!/usr/bin/env node

// 402問をD1データベースに投入するスクリプト
const fs = require('fs');
const path = require('path');

// JSONファイルを読み込み
const questionsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/questions-402-complete.json'), 'utf8')
);

// SQLファイルを生成
const sqlPath = path.join(__dirname, '../migrations/0003_insert_402_questions.sql');

let sql = `-- 402問完全データベース投入
-- Generated: ${new Date().toISOString()}
-- Total: ${questionsData.length} questions

-- 既存のサンプルデータをクリア（Q001-Q005を除く）
DELETE FROM questions WHERE id NOT IN ('Q001', 'Q002', 'Q003', 'Q004', 'Q005');

-- 402問を投入
`;

// バッチ処理（10問ずつ）
const batchSize = 10;
for (let i = 0; i < questionsData.length; i += batchSize) {
  const batch = questionsData.slice(i, Math.min(i + batchSize, questionsData.length));
  
  sql += `-- Batch ${Math.floor(i/batchSize) + 1}\n`;
  
  batch.forEach(q => {
    // オプションを適切にエスケープ
    const optionsStr = JSON.stringify(q.options).replace(/'/g, "''");
    const questionText = q.question_text.replace(/'/g, "''");
    const explanation = q.explanation.replace(/'/g, "''");
    
    sql += `INSERT OR IGNORE INTO questions (id, subject, category, difficulty, question_text, options, correct_answer, explanation) VALUES
('${q.id}', '${q.subject}', '${q.category}', '${q.difficulty}', 
'${questionText}', 
'${optionsStr}', 
${q.correct_answer}, 
'${explanation}');
`;
  });
  
  sql += '\n';
}

// ファイルに書き込み
fs.writeFileSync(sqlPath, sql);

console.log(`✅ SQLファイル生成完了: ${sqlPath}`);
console.log(`📊 総問題数: ${questionsData.length}問`);
console.log('\n次のコマンドでデータベースに投入してください:');
console.log('npx wrangler d1 migrations apply takken-boost-production --local');