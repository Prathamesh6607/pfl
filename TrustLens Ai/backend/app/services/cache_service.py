import json

import redis

from app.utils.config import get_settings


class CacheService:
    def __init__(self) -> None:
        self.client = redis.from_url(get_settings().redis_url, decode_responses=True)

    def get(self, key: str) -> dict | None:
        raw = self.client.get(key)
        return json.loads(raw) if raw else None

    def set(self, key: str, payload: dict, ttl_seconds: int = 300) -> None:
        self.client.setex(key, ttl_seconds, json.dumps(payload))
