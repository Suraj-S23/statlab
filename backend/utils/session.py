import redis
import json
import uuid
import os
from typing import Optional

REDIS_HOST = os.getenv("REDISHOST", os.getenv("REDIS_HOST", "localhost"))
REDIS_PORT = int(os.getenv("REDISPORT", os.getenv("REDIS_PORT", "6379")))
REDIS_PASSWORD = os.getenv("REDISPASSWORD", os.getenv("REDIS_PASSWORD", None))

r = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    password=REDIS_PASSWORD,
    db=0,
    decode_responses=True,
)

SESSION_TTL = 60 * 60 * 2  # 2 hours


def create_session(data: list[dict]) -> str:
    session_id = str(uuid.uuid4())
    r.setex(session_id, SESSION_TTL, json.dumps(data))
    return session_id


def get_session(session_id: str) -> Optional[list[dict]]:
    raw = r.get(session_id)
    if raw is None:
        return None
    return json.loads(raw)


def delete_session(session_id: str) -> None:
    r.delete(session_id)
