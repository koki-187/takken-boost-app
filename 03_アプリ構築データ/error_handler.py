# -*- coding: utf-8 -*-
"""
宅建BOOSTアプリ - 高度なエラーハンドリングモジュール
GENSPARK AIワークフローによる改善版

このモジュールは以下の機能を提供します:
- カスタム例外クラス
- グローバルエラーハンドラー
- ログ機能
- エラー通知システム
- リトライメカニズム
"""

import logging
import traceback
from datetime import datetime
from functools import wraps
from typing import Optional, Dict, Any
import json
from enum import Enum


class ErrorSeverity(Enum):
    """エラーの重要度を定義"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TakkenBoostError(Exception):
    """宅建BOOSTアプリのベース例外クラス"""
    def __init__(self, message: str, error_code: str = None, severity: ErrorSeverity = ErrorSeverity.MEDIUM):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.severity = severity
        self.timestamp = datetime.now()
        self.context = {}

    def add_context(self, **kwargs):
        """エラーにコンテキスト情報を追加"""
        self.context.update(kwargs)

    def to_dict(self):
        """エラー情報を辞書形式で返す"""
        return {
            'message': self.message,
            'error_code': self.error_code,
            'severity': self.severity.value,
            'timestamp': self.timestamp.isoformat(),
            'context': self.context
        }


class DatabaseError(TakkenBoostError):
    """データベース関連のエラー"""
    def __init__(self, message: str, query: str = None):
        super().__init__(message, "DB_ERROR", ErrorSeverity.HIGH)
        if query:
            self.add_context(query=query)


class UserAuthError(TakkenBoostError):
    """ユーザー認証エラー"""
    def __init__(self, message: str, user_id: str = None):
        super().__init__(message, "AUTH_ERROR", ErrorSeverity.MEDIUM)
        if user_id:
            self.add_context(user_id=user_id)


class PaymentError(TakkenBoostError):
    """支払い処理エラー"""
    def __init__(self, message: str, transaction_id: str = None):
        super().__init__(message, "PAYMENT_ERROR", ErrorSeverity.CRITICAL)
        if transaction_id:
            self.add_context(transaction_id=transaction_id)


class QuizError(TakkenBoostError):
    """クイズ関連エラー"""
    def __init__(self, message: str, quiz_id: str = None):
        super().__init__(message, "QUIZ_ERROR", ErrorSeverity.LOW)
        if quiz_id:
            self.add_context(quiz_id=quiz_id)


class ErrorHandler:
    """エラーハンドリングの中央管理クラス"""
    
    def __init__(self):
        self.logger = self._setup_logger()
        self.error_callbacks = []
        
    def _setup_logger(self):
        """ログシステムの設定"""
        logger = logging.getLogger('takken_boost')
        logger.setLevel(logging.INFO)
        
        # コンソールハンドラー
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        
        # ファイルハンドラー
        file_handler = logging.FileHandler('logs/error.log', encoding='utf-8')
        file_handler.setLevel(logging.ERROR)
        
        # フォーマッター
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        console_handler.setFormatter(formatter)
        file_handler.setFormatter(formatter)
        
        logger.addHandler(console_handler)
        logger.addHandler(file_handler)
        
        return logger
    
    def register_callback(self, callback):
        """エラー発生時のコールバック関数を登録"""
        self.error_callbacks.append(callback)
    
    def handle_error(self, error: Exception, context: Dict[str, Any] = None):
        """エラーを処理する中央ハンドラー"""
        if isinstance(error, TakkenBoostError):
            error_data = error.to_dict()
        else:
            error_data = {
                'message': str(error),
                'error_code': 'UNKNOWN_ERROR',
                'severity': ErrorSeverity.MEDIUM.value,
                'timestamp': datetime.now().isoformat(),
                'context': context or {}
            }
        
        # ログに記録
        self._log_error(error_data)
        
        # コールバック実行
        for callback in self.error_callbacks:
            try:
                callback(error_data)
            except Exception as callback_error:
                self.logger.error(f"エラーコールバック実行中にエラー: {callback_error}")
        
        return error_data
    
    def _log_error(self, error_data: Dict[str, Any]):
        """エラーをログに記録"""
        severity = error_data.get('severity', ErrorSeverity.MEDIUM.value)
        message = json.dumps(error_data, ensure_ascii=False, indent=2)
        
        if severity == ErrorSeverity.CRITICAL.value:
            self.logger.critical(message)
        elif severity == ErrorSeverity.HIGH.value:
            self.logger.error(message)
        elif severity == ErrorSeverity.MEDIUM.value:
            self.logger.warning(message)
        else:
            self.logger.info(message)


def error_handler_decorator(handler: ErrorHandler = None, retry_count: int = 0):
    """エラーハンドリングデコレーター"""
    if handler is None:
        handler = ErrorHandler()
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_error = None
            for attempt in range(retry_count + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_error = e
                    if attempt < retry_count:
                        handler.logger.info(f"リトライ {attempt + 1}/{retry_count}: {func.__name__}")
                        continue
                    else:
                        # 最終的なエラー処理
                        context = {
                            'function': func.__name__,
                            'args': str(args),
                            'kwargs': str(kwargs),
                            'attempt': attempt + 1
                        }
                        handler.handle_error(last_error, context)
                        raise
        return wrapper
    return decorator


# グローバルエラーハンドラーインスタンス
global_error_handler = ErrorHandler()


def setup_global_error_handler():
    """グローバルエラーハンドラーの初期設定"""
    import sys
    
    def handle_exception(exc_type, exc_value, exc_traceback):
        if issubclass(exc_type, KeyboardInterrupt):
            sys.__excepthook__(exc_type, exc_value, exc_traceback)
            return
        
        global_error_handler.handle_error(
            exc_value, 
            context={
                'type': exc_type.__name__,
                'traceback': ''.join(traceback.format_exception(exc_type, exc_value, exc_traceback))
            }
        )
    
    sys.excepthook = handle_exception


# 使用例
if __name__ == "__main__":
    # グローバルエラーハンドラーの設定
    setup_global_error_handler()
    
    # エラーコールバックの例
    def notify_admin(error_data):
        if error_data['severity'] == ErrorSeverity.CRITICAL.value:
            print(f"【緊急】管理者に通知: {error_data['message']}")
    
    global_error_handler.register_callback(notify_admin)
    
    # デコレーターの使用例
    @error_handler_decorator(retry_count=3)
    def sample_function():
        raise DatabaseError("データベース接続エラー", query="SELECT * FROM users")
    
    try:
        sample_function()
    except Exception:
        print("エラーが適切に処理されました")
