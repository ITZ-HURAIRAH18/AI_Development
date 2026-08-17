from typing import Any

from fastapi.responses import JSONResponse


def success(data: Any, status_code: int = 200) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"success": True, "data": data})


def error(message: str, status_code: int = 400) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"success": False, "message": message})
