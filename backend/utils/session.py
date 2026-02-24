"""
Session utility — manages temporary dataset storage in Redis.

When a user uploads a CSV, the parsed dataframe is serialised and
stored in Redis with a UUID session key. All subsequent analysis
requests reference this key instead of re-sending the full dataset.

Sessions expire automatically after 2 hours.
"""

import redis
import json
import uuid
from typing import Optional

# Connect to local Redis instance
r = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

# Session expiry time in seconds (2 hours)
SESSION_TTL = 60 * 60 * 2


def create_session(data: list[dict]) -> str:
    """
    Store a dataset in Redis and return a unique session ID.
    The data is serialised to JSON and expires after SESSION_TTL seconds.
    """
    session_id = str(uuid.uuid4())
    r.setex(session_id, SESSION_TTL, json.dumps(data))
    return session_id


def get_session(session_id: str) -> Optional[list[dict]]:
    """
    Retrieve a dataset from Redis by session ID.
    Returns None if the session has expired or does not exist.
    """
    raw = r.get(session_id)
    if raw is None:
        return None
    return json.loads(raw)


def delete_session(session_id: str) -> None:
    """Explicitly delete a session from Redis before it expires."""
    r.delete(session_id)
