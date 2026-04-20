import json
from typing import Dict, Optional

import redis

from app.utils.config import get_settings


class CacheService:
    def __init__(self) -> None:
        try:
            self.client = redis.from_url(get_settings().redis_url, decode_responses=True)
            self.client.ping()
            self.available = True
        except Exception:
            self.client = None
            self.available = False

    def get(self, key: str) -> Optional[Dict]:
        if not self.available:
            return None
        try:
            raw = self.client.get(key)
            return json.loads(raw) if raw else None
        except Exception:
            return None

    def set(self, key: str, payload: Dict, ttl_seconds: int = 300) -> None:
        if not self.available:
            return
        try:
            self.client.setex(key, ttl_seconds, json.dumps(payload))
        except Exception:
            pass
