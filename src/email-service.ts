// Email Service with SendGrid for 宅建BOOST
import { Bindings } from './index'

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private apiKey: string | undefined;
  private isEnabled: boolean;

  constructor(env: Bindings) {
    this.apiKey = env.SENDGRID_API_KEY;
    this.isEnabled = !!this.apiKey;
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isEnabled) {
      console.log('SendGrid is not configured. Logging email instead:');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Body:', options.text || options.html);
      return true;
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: options.to }]
          }],
          from: { 
            email: 'noreply@takken-boost.com',
            name: '宅建BOOST'
          },
          subject: options.subject,
          content: [
            {
              type: 'text/plain',
              value: options.text || this.htmlToText(options.html)
            },
            {
              type: 'text/html',
              value: options.html
            }
          ]
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // 新規ユーザー登録通知
  async sendRegistrationNotification(
    adminEmail: string,
    userId: number,
    userEmail: string,
    userName?: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 10px; }
          .content { background: #f7f7f7; padding: 20px; margin-top: 20px; border-radius: 10px; }
          .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .label { font-weight: bold; color: #666; }
          .value { color: #333; margin-left: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎉 新規ユーザー登録通知</h2>
            <p>宅建BOOSTに新しいユーザーが登録されました</p>
          </div>
          
          <div class="content">
            <div class="info-box">
              <span class="label">ユーザーID:</span>
              <span class="value">${userId}</span>
            </div>
            
            <div class="info-box">
              <span class="label">メールアドレス:</span>
              <span class="value">${userEmail}</span>
            </div>
            
            <div class="info-box">
              <span class="label">名前:</span>
              <span class="value">${userName || '未設定'}</span>
            </div>
            
            <div class="info-box">
              <span class="label">登録日時:</span>
              <span class="value">${new Date().toLocaleString('ja-JP')}</span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: adminEmail,
      subject: '【宅建BOOST】新規ユーザー登録通知',
      html
    });
  }

  // 学習進捗レポート
  async sendProgressReport(
    userEmail: string,
    userName: string,
    statistics: any
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 10px; }
          .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 20px 0; }
          .stat-box { background: white; padding: 15px; border-radius: 5px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .stat-value { font-size: 24px; font-weight: bold; color: #764ba2; }
          .stat-label { font-size: 12px; color: #666; }
          .progress-bar { background: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden; margin: 20px 0; }
          .progress-fill { background: linear-gradient(90deg, #667eea, #764ba2); height: 100%; transition: width 0.3s; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📊 学習進捗レポート</h2>
            <p>${userName}さんの今週の学習状況</p>
          </div>
          
          <div class="stats">
            <div class="stat-box">
              <div class="stat-value">${statistics.totalQuestions || 0}</div>
              <div class="stat-label">総解答数</div>
            </div>
            
            <div class="stat-box">
              <div class="stat-value">${statistics.correctAnswers || 0}</div>
              <div class="stat-label">正解数</div>
            </div>
            
            <div class="stat-box">
              <div class="stat-value">${statistics.accuracy || 0}%</div>
              <div class="stat-label">正答率</div>
            </div>
          </div>
          
          <div>
            <h3>カテゴリー別進捗</h3>
            ${statistics.categories?.map(cat => `
              <div style="margin: 10px 0;">
                <div style="display: flex; justify-content: space-between;">
                  <span>${cat.name}</span>
                  <span>${cat.accuracy}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${cat.accuracy}%"></div>
                </div>
              </div>
            `).join('') || '<p>データがありません</p>'}
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background: #f0f0f0; border-radius: 5px;">
            <h4>💡 学習アドバイス</h4>
            <p>${statistics.advice || '継続的な学習が成功への鍵です。毎日少しずつでも問題に取り組みましょう。'}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: '【宅建BOOST】週間学習レポート',
      html
    });
  }

  // 模擬試験結果通知
  async sendExamResult(
    userEmail: string,
    userName: string,
    examResult: any
  ): Promise<boolean> {
    const passed = examResult.score >= 70;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { 
            background: ${passed ? 'linear-gradient(135deg, #4caf50, #45a049)' : 'linear-gradient(135deg, #f44336, #da190b)'};
            color: white; 
            padding: 20px; 
            border-radius: 10px;
            text-align: center;
          }
          .score-display {
            font-size: 48px;
            font-weight: bold;
            margin: 20px 0;
          }
          .result-details {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${passed ? '🎊 合格おめでとうございます！' : '📝 お疲れ様でした'}</h2>
            <div class="score-display">${examResult.score}点</div>
            <p>${passed ? '素晴らしい成績です！' : '次回は合格を目指しましょう！'}</p>
          </div>
          
          <div class="result-details">
            <h3>試験結果詳細</h3>
            
            <div class="detail-row">
              <span>総問題数</span>
              <span>${examResult.totalQuestions}問</span>
            </div>
            
            <div class="detail-row">
              <span>正解数</span>
              <span>${examResult.correctAnswers}問</span>
            </div>
            
            <div class="detail-row">
              <span>不正解数</span>
              <span>${examResult.incorrectAnswers}問</span>
            </div>
            
            <div class="detail-row">
              <span>所要時間</span>
              <span>${Math.floor(examResult.timeSpent / 60)}分${examResult.timeSpent % 60}秒</span>
            </div>
            
            <div class="detail-row">
              <span>合格ライン</span>
              <span>70点</span>
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 5px;">
            <h4>次のステップ</h4>
            <p>
              ${passed 
                ? '合格レベルに達しています！本番試験に向けて、苦手分野の復習を続けましょう。'
                : '苦手分野を重点的に復習し、正答率を上げていきましょう。AI分析機能で弱点を特定できます。'}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `【宅建BOOST】模擬試験結果: ${examResult.score}点`,
      html
    });
  }

  private htmlToText(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}

export default EmailService