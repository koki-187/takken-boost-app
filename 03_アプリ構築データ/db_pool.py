# -*- coding: utf-8 -*-
"""
宅建BOOSTアプリ - データベース接続プールモジュール
GENSPARK AIワークフローによる改善版

機能:
- 環境変数ベースのDB設定
- コネクションプール（psycopg / mysql / sqlite に対応しやすい抽象化）
- コンテキストマネージャでの安全な接続貸し出し
- 健全性チェックと再接続
- 接続リーク防止
"""

import os
import threading
import queue
import time
from contextlib import contextmanager
from typing import Optional, Tuple

try:
    import psycopg2
    import psycopg2.pool
    DB_BACKEND = "postgres"
except Exception:
    # フォールバック（実運用では依存を固定推奨）
    import sqlite3
    DB_BACKEND = "sqlite"

DEFAULT_MIN_CONN = int(os.getenv("DB_MIN_CONN", "1"))
DEFAULT_MAX_CONN = int(os.getenv("DB_MAX_CONN", "5"))
DB_DSN = os.getenv("DATABASE_URL", "sqlite:///takken.db")


class DBPool:
    _instance = None
    _lock = threading.Lock()

    def __init__(self, minconn: int = DEFAULT_MIN_CONN, maxconn: int = DEFAULT_MAX_CONN, dsn: str = DB_DSN):
        self.minconn = minconn
        self.maxconn = maxconn
        self.dsn = dsn
        self._pool = None
        self._queue: Optional[queue.Queue] = None
        self._init_pool()

    def _init_pool(self):
        if DB_BACKEND == "postgres":
            # 例: DATABASE_URL=postgresql://user:pass@host:port/db
            self._pool = psycopg2.pool.SimpleConnectionPool(self.minconn, self.maxconn, self.dsn)
        else:
            # 簡易SQLiteプール（疑似）。実コネクションは軽量なのでQueueで貸し出し管理
            path = self.dsn.split("sqlite:///")[-1]
            self._queue = queue.Queue(maxsize=self.maxconn)
            for _ in range(self.maxconn):
                self._queue.put(sqlite3.connect(path, check_same_thread=False))

    @classmethod
    def instance(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = DBPool()
        return cls._instance

    def _get_conn(self):
        if DB_BACKEND == "postgres":
            return self._pool.getconn()
        return self._queue.get()

    def _put_conn(self, conn):
        if DB_BACKEND == "postgres":
            return self._pool.putconn(conn)
        return self._queue.put(conn)

    def _is_healthy(self, conn) -> bool:
        try:
            if DB_BACKEND == "postgres":
                with conn.cursor() as cur:
                    cur.execute("SELECT 1")
                    cur.fetchone()
            else:
                cur = conn.cursor()
                cur.execute("SELECT 1")
                cur.fetchone()
            return True
        except Exception:
            return False

    def _reconnect(self, conn):
        try:
            if DB_BACKEND == "postgres":
                # 破棄して新規払い出し
                try:
                    self._pool.putconn(conn, close=True)
                except Exception:
                    pass
                return self._pool.getconn()
            else:
                # SQLite: 新規接続を生成
                path = self.dsn.split("sqlite:///")[-1]
                return sqlite3.connect(path, check_same_thread=False)
        except Exception:
            # 再接続リトライ（指数バックオフ）
            delay = 0.2
            for _ in range(4):
                time.sleep(delay)
                try:
                    if DB_BACKEND == "postgres":
                        return self._pool.getconn()
                    else:
                        path = self.dsn.split("sqlite:///")[-1]
                        return sqlite3.connect(path, check_same_thread=False)
                except Exception:
                    delay *= 2
            raise

    @contextmanager
    def connection(self):
        conn = self._get_conn()
        try:
            if not self._is_healthy(conn):
                conn = self._reconnect(conn)
            yield conn
            # トランザクションを暗黙コミット
            try:
                conn.commit()
            except Exception:
                # 読み取り専用等はコミット不要
                pass
        except Exception:
            try:
                conn.rollback()
            except Exception:
                pass
            raise
        finally:
            self._put_conn(conn)


# 便利関数
get_db_pool = DBPool.instance


# 簡単な使用例
if __name__ == "__main__":
    pool = get_db_pool()
    with pool.connection() as conn:
        cur = conn.cursor()
        if DB_BACKEND == "sqlite":
            cur.execute("CREATE TABLE IF NOT EXISTS healthcheck (id INTEGER PRIMARY KEY, ok INT)")
        cur.execute("SELECT 1")
        print(cur.fetchone())
graph LR
    A[Natural Language Input] --> B[Genspark Super Agent]
    B --> C[LLM Processing]
    C --> D[Code Generation/Analysis]
    D --> E[GitHub Integration]
    E --> F[Repository Updates]
"Add error handling to the user authentication function"
"Refactor the database connection code to use connection pooling"
"Create unit tests for the payment processing module""Generate comprehensive documentation for the REST API"
"Create inline comments for complex algorithms""Generate comprehensive documentation for the REST API"
"Create inline comments for complex algorithms""Write integration tests for the user registration flow"
"Generate mock data for testing the recommendation engine"
