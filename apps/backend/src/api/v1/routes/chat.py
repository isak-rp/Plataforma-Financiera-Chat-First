from fastapi import APIRouter, Depends

from src.core.security import CurrentUser, get_current_user
from src.schemas.chat import ChatRequest, ChatResponse
from src.services.chat_service import process_chat_message

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    current_user: CurrentUser = Depends(get_current_user),
) -> ChatResponse:
    return await process_chat_message(current_user.id, payload)
