from fastapi import APIRouter
from backend.schemas.discovery import DiscoverySearchRequest, DiscoverySearchResponse
from backend.services.tinyfish_service import tinyfish_service

router = APIRouter(prefix="/api/discovery", tags=["Discovery"])


@router.post("/search", response_model=DiscoverySearchResponse)
async def search_scholarships(req: DiscoverySearchRequest):
    result = await tinyfish_service.search_scholarships(
        query=req.query,
        domains=req.domains,
        force_live=req.forceLive,
    )
    return DiscoverySearchResponse(**result)


@router.post("/fetch")
async def fetch_page_content(url: str):
    return await tinyfish_service.fetch_page_content(url)
