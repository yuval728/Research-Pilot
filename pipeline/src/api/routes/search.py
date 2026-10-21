"""
pipeline.api.routes.search
~~~~~~~~~~~~~~~~~~~~~~~~~~
Semantic search endpoints powered by pgvector + LLM embeddings.
"""

from __future__ import annotations

import uuid

import structlog
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from src.api.dependencies import CurrentUserDep, PaperServiceDep
from src.core.exceptions import EmbeddingError
from src.models.paper import Paper

router = APIRouter(prefix="/search", tags=["search"])


# ---------------------------------------------------------------------------
# Request / response schemas
# ---------------------------------------------------------------------------


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Natural language search query.")
    limit: int = Field(
        default=5,
        ge=1,
        le=50,
        description="Maximum number of results to return.",
    )


class SearchResult(BaseModel):
    paper: Paper
    score: float = Field(
        ...,
        description="Cosine similarity score — higher is more relevant (range 0–1).",
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.post(
    "",
    response_model=list[Paper],
    summary="Semantic paper search",
    description=(
        "Embeds the query using the configured LLM embedding model and runs "
        "a cosine similarity search against all stored paper embeddings via pgvector. "
        "Returns papers ranked by relevance."
    ),
)
async def search_papers(
    body: SearchRequest,
    paper_service: PaperServiceDep,
    _user: CurrentUserDep,
) -> list[Paper]:
    """Return the *limit* most semantically similar papers to *query*."""
    try:
        return await paper_service.search_papers(
            body.query, limit=body.limit, user_id=_user
        )
    except EmbeddingError:
        # Let global ResearchPilotError handler format a structured response.
        raise
    except Exception as exc:
        structlog.get_logger(__name__).exception("search_failed", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Search failed due to an internal error.",
        ) from exc


@router.get(
    "/similar/{paper_id}",
    response_model=list[Paper],
    summary="Find papers similar to a given paper",
    description=(
        "Uses the stored embeddings of *paper_id* to find other papers in the library "
        "that share the most similar content, ranked by cosine distance."
    ),
)
async def similar_papers(
    paper_id: uuid.UUID,
    paper_service: PaperServiceDep,
    _user: CurrentUserDep,
    limit: int = 5,
) -> list[Paper]:
    """Return papers most similar to *paper_id* using its stored embeddings."""
    try:
        return await paper_service.find_similar_papers(
            paper_id, limit=limit, user_id=_user
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND
            if "not found" in str(exc).lower()
            else status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except EmbeddingError:
        raise
    except Exception as exc:
        structlog.get_logger(__name__).exception(
            "similarity_search_failed", error=str(exc)
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Similarity search failed due to an internal error.",
        ) from exc
