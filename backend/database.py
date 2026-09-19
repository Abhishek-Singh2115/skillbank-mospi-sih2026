import logging
from typing import Optional, Dict, Any, List
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from backend.config import settings

logger = logging.getLogger("skillbank.database")

# In-memory document fallback store for zero-friction local development without MongoDB
class InMemoryCollection:
    """Async-compatible in-memory collection mock for testing and demonstration."""
    def __init__(self, name: str):
        self.name = name
        self.docs: Dict[str, Dict[str, Any]] = {}

    async def find_one(self, filter_query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for doc in self.docs.values():
            if all(doc.get(k) == v for k, v in filter_query.items()):
                return dict(doc)
        return None

    def find(self, filter_query: Optional[Dict[str, Any]] = None):
        filter_query = filter_query or {}
        matching = []
        for doc in self.docs.values():
            if all(doc.get(k) == v for k, v in filter_query.items()):
                matching.append(dict(doc))
        
        class Cursor:
            def __init__(self, items):
                self.items = items
            def __aiter__(self):
                self._iter = iter(self.items)
                return self
            async def __anext__(self):
                try:
                    return next(self._iter)
                except StopIteration:
                    raise StopAsyncIteration
            async def to_list(self, length: Optional[int] = None):
                return self.items[:length] if length is not None else self.items

        return Cursor(matching)

    async def insert_one(self, document: Dict[str, Any]):
        doc_id = str(document.get("_id", document.get("id", len(self.docs) + 1)))
        document["_id"] = doc_id
        self.docs[doc_id] = dict(document)
        class Result:
            inserted_id = doc_id
        return Result()

    async def update_one(self, filter_query: Dict[str, Any], update_query: Dict[str, Any], upsert: bool = False):
        target = await self.find_one(filter_query)
        if target:
            doc_id = str(target["_id"])
            if "$set" in update_query:
                self.docs[doc_id].update(update_query["$set"])
        elif upsert:
            new_doc = dict(filter_query)
            if "$set" in update_query:
                new_doc.update(update_query["$set"])
            await self.insert_one(new_doc)
        class Result:
            modified_count = 1
        return Result()

    async def count_documents(self, filter_query: Dict[str, Any]) -> int:
        count = 0
        for doc in self.docs.values():
            if all(doc.get(k) == v for k, v in filter_query.items()):
                count += 1
        return count


class DatabaseManager:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    is_connected: bool = False
    in_memory_collections: Dict[str, InMemoryCollection] = {}

    async def connect(self):
        """Attempts connection to MongoDB; falls back to in-memory store if offline."""
        try:
            logger.info(f"Connecting to MongoDB at {settings.MONGO_URI} (timeout 3.0s)...")
            self.client = AsyncIOMotorClient(
                settings.MONGO_URI,
                serverSelectionTimeoutMS=3000
            )
            # Ping database to confirm live connection
            await self.client.admin.command('ping')
            self.db = self.client[settings.DATABASE_NAME]
            self.is_connected = True
            logger.info(f"Successfully connected to MongoDB: database '{settings.DATABASE_NAME}'.")
        except Exception as e:
            self.is_connected = False
            logger.warning(
                f"MongoDB instance not accessible ({e}). "
                "Engaging resilient In-Memory Document Store. Zero downtime guaranteed."
            )

    async def disconnect(self):
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed.")

    def get_collection(self, name: str):
        """Returns the real MongoDB collection or an async in-memory fallback collection."""
        if self.is_connected and self.db is not None:
            return self.db[name]
        if name not in self.in_memory_collections:
            self.in_memory_collections[name] = InMemoryCollection(name)
        return self.in_memory_collections[name]

db_manager = DatabaseManager()
