from __future__ import annotations

import uuid
from datetime import UTC, datetime
from unittest.mock import AsyncMock, patch

from fastapi import status
from fastapi.testclient import TestClient

from src.models.batch import BatchItemStatus, BatchJobItemResponse, BatchJobResponse, BatchJobStatus


def test_trigger_batch_run_endpoint(test_client: TestClient):
    paper1 = uuid.uuid4()
    paper2 = uuid.uuid4()
    batch_id = uuid.uuid4()

    mock_response = BatchJobResponse(
        id=batch_id,
        status=BatchJobStatus.PENDING,
        total_papers=2,
        completed_papers=0,
        failed_papers=0,
        items=[
            BatchJobItemResponse(
                id=uuid.uuid4(),
                batch_id=batch_id,
                paper_id=paper1,
                status=BatchItemStatus.PENDING,
                created_at=datetime.now(UTC),
                updated_at=datetime.now(UTC),
            ),
            BatchJobItemResponse(
                id=uuid.uuid4(),
                batch_id=batch_id,
                paper_id=paper2,
                status=BatchItemStatus.PENDING,
                created_at=datetime.now(UTC),
                updated_at=datetime.now(UTC),
            ),
        ],
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    with patch(
        "src.services.pipeline_service.PipelineService.trigger_batch_run",
        new_callable=AsyncMock,
    ) as mock_trigger:
        mock_trigger.return_value = mock_response
        response = test_client.post(
            "/api/v1/pipeline/batch",
            json={"paper_ids": [str(paper1), str(paper2)]},
        )

    assert response.status_code == status.HTTP_202_ACCEPTED
    data = response.json()
    assert data["id"] == str(batch_id)
    assert data["total_papers"] == 2
    assert len(data["items"]) == 2


def test_get_batch_status_endpoint(test_client: TestClient):
    batch_id = uuid.uuid4()
    paper1 = uuid.uuid4()

    mock_response = BatchJobResponse(
        id=batch_id,
        status=BatchJobStatus.COMPLETED,
        total_papers=1,
        completed_papers=1,
        failed_papers=0,
        items=[
            BatchJobItemResponse(
                id=uuid.uuid4(),
                batch_id=batch_id,
                paper_id=paper1,
                status=BatchItemStatus.COMPLETED,
                created_at=datetime.now(UTC),
                updated_at=datetime.now(UTC),
            )
        ],
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    with patch(
        "src.services.pipeline_service.PipelineService.get_batch_status",
        new_callable=AsyncMock,
    ) as mock_get:
        mock_get.return_value = mock_response
        response = test_client.get(f"/api/v1/pipeline/batch/{batch_id}")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == str(batch_id)
    assert data["status"] == "completed"
    assert data["completed_papers"] == 1


def test_get_batch_status_not_found(test_client: TestClient):
    batch_id = uuid.uuid4()

    with patch(
        "src.services.pipeline_service.PipelineService.get_batch_status",
        new_callable=AsyncMock,
    ) as mock_get:
        mock_get.side_effect = ValueError("BatchJob not found")
        response = test_client.get(f"/api/v1/pipeline/batch/{batch_id}")

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "BatchJob not found"
