from typing import Any

from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse


def success(data: Any, status_code: int = 200) -> JSONResponse:
    return JSONResponse(status_code=status_code, content=jsonable_encoder({"success": True, "data": data}))


def error(message: str, status_code: int = 400) -> JSONResponse:
    return JSONResponse(status_code=status_code, content=jsonable_encoder({"success": False, "message": message}))

