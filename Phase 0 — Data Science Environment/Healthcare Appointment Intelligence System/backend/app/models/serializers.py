from typing import Any, List

from app.models import serialize_doc


async def aggregate_to_list(collection, pipeline: List[dict[str, Any]]) -> List[dict]:
    cursor = collection.aggregate(pipeline)
    return [serialize_doc(doc) for doc in await cursor.to_list(length=None)]


async def find_to_list(collection, query: dict, sort: list | None = None, skip: int | None = None, limit: int | None = None) -> List[dict]:
    cursor = collection.find(query)
    if sort:
        cursor = cursor.sort(sort)
    if skip:
        cursor = cursor.skip(skip)
    if limit:
        cursor = cursor.limit(limit)
    return [serialize_doc(doc) for doc in await cursor.to_list(length=limit or None)]


async def count_documents(collection, query: dict) -> int:
    return await collection.count_documents(query)
