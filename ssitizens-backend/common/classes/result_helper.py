from typing import Generic, Optional, TypeVar

T = TypeVar("T")
E = TypeVar("E")


class Result(Generic[T, E]):
    value: Optional[T]
    error: Optional[E]

    def __init__(self, value: Optional[T], error: Optional[E]) -> None:
        self.value = value
        self.error = error

    @staticmethod
    def Ok(value: T) -> "Result[T, None]":
        return Result(value, None)

    @staticmethod
    def Error(error: E) -> "Result[None, E]":
        return Result(None, error)

    def is_error(self) -> bool:
        return self.error != None

    def unwrap(self) -> T:
        if self.is_error():
            raise Exception("Unwrap of error value")
        return self.value

    def unwrap_error(self) -> E:
        if not self.is_error():
            raise Exception("Unwrap of non error value")
        return self.error
