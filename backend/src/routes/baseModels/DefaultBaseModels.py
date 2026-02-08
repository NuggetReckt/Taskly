from typing import Optional

from pydantic import BaseModel


class Status(BaseModel):
    status: str
    code: Optional[int] = 0
    message: Optional[str] = None


statusOk = Status(status="OK")
