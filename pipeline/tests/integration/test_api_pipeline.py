from __future__ import annotations

import uuid
from unittest.mock import AsyncMock, patch

from fastapi import status
from fastapi.testclient import TestClient

from src.models.run import PipelineRun, RunStatus


def test_get_latest_run_for_paper_returns_latest_run(test_client: TestClient):
    paper_id = uuid.uuid4()
    run = PipelineRun(
        id=uuid.uuid4(),
        paper_id=paper_id,
        status=RunStatus.COMPLETED,
        stages={},
    )

    with patch(
        "src.services.pipeline_service.PipelineService.get_latest_run_for_paper",
        new_callable=AsyncMock,
    ) as mock_latest:
        mock_latest.return_value = run
        response = test_client.get(f"/api/v1/pipeline/papers/{paper_id}/latest-run")

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["id"] == str(run.id)
    assert response.json()["paper_id"] == str(paper_id)


def test_get_latest_run_for_paper_returns_null_when_absent(test_client: TestClient):
    paper_id = uuid.uuid4()

    with patch(
        "src.services.pipeline_service.PipelineService.get_latest_run_for_paper",
        new_callable=AsyncMock,
    ) as mock_latest:
        mock_latest.return_value = None
        response = test_client.get(f"/api/v1/pipeline/papers/{paper_id}/latest-run")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() is None


def test_stream_run_status_does_not_leak_exception_details(test_client: TestClient):
    run_id = uuid.uuid4()
    secret_internal_error = "SecretDBConnectionString: postgresql://user:pass@db:5432/db"

    with patch(
        "src.services.pipeline_service.PipelineService.get_run_status",
        new_callable=AsyncMock,
    ) as mock_status, patch("asyncio.sleep", new_callable=AsyncMock):
        mock_status.side_effect = Exception(secret_internal_error)
        response = test_client.get(f"/api/v1/pipeline/runs/{run_id}/stream")

    assert response.status_code == status.HTTP_200_OK
    assert secret_internal_error not in response.text
    assert "Stream failed after repeated errors" in response.text
    assert '"detail"' not in response.text
