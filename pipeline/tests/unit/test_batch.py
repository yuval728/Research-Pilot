from __future__ import annotations

import asyncio
import uuid
from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from src.db.models import BatchJobItemORM, BatchJobORM, PaperORM
from src.models.batch import BatchItemStatus, BatchJobResponse, BatchJobStatus
from src.services.pipeline_service import PipelineService


@pytest.mark.asyncio
async def test_trigger_batch_run_empty_list_raises_error():
    db = AsyncMock()
    svc = PipelineService(db)
    with pytest.raises(ValueError, match="paper_ids list cannot be empty"):
        await svc.trigger_batch_run([])


@pytest.mark.asyncio
async def test_trigger_batch_run_missing_papers_raises_error():
    paper1 = uuid.uuid4()
    paper2 = uuid.uuid4()

    db = AsyncMock()
    exec_result = MagicMock()
    exec_result.scalars.return_value.all.return_value = [paper1]  # paper2 missing
    db.execute = AsyncMock(return_value=exec_result)

    svc = PipelineService(db)
    with pytest.raises(ValueError, match="Papers not found or access denied"):
        await svc.trigger_batch_run([paper1, paper2])


@pytest.mark.asyncio
async def test_trigger_batch_run_creates_batch_job():
    paper1 = uuid.uuid4()
    paper2 = uuid.uuid4()
    batch_id = uuid.uuid4()

    batch_orm = BatchJobORM(
        id=batch_id,
        status="pending",
        total_papers=2,
        completed_papers=0,
        failed_papers=0,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
        items=[
            BatchJobItemORM(
                id=uuid.uuid4(),
                batch_id=batch_id,
                paper_id=paper1,
                status="pending",
                created_at=datetime.now(UTC),
                updated_at=datetime.now(UTC),
            ),
            BatchJobItemORM(
                id=uuid.uuid4(),
                batch_id=batch_id,
                paper_id=paper2,
                status="pending",
                created_at=datetime.now(UTC),
                updated_at=datetime.now(UTC),
            ),
        ],
    )

    db = AsyncMock()
    exec_result = MagicMock()
    exec_result.scalars.return_value.all.return_value = [paper1, paper2]

    loaded_result = MagicMock()
    loaded_result.scalar_one.return_value = batch_orm

    db.execute = AsyncMock(side_effect=[exec_result, loaded_result])
    db.add = MagicMock()
    db.commit = AsyncMock()

    with patch("asyncio.get_running_loop") as mock_loop:
        mock_loop.return_value.create_task = MagicMock()
        svc = PipelineService(db)
        res = await svc.trigger_batch_run([paper1, paper2])

    assert isinstance(res, BatchJobResponse)
    assert res.total_papers == 2
    assert res.status == BatchJobStatus.PENDING
    assert len(res.items) == 2


@pytest.mark.asyncio
async def test_execute_batch_job_partial_failure():
    batch_id = uuid.uuid4()
    item1_id = uuid.uuid4()
    item2_id = uuid.uuid4()
    paper1_id = uuid.uuid4()
    paper2_id = uuid.uuid4()

    item1 = BatchJobItemORM(
        id=item1_id,
        batch_id=batch_id,
        paper_id=paper1_id,
        status="pending",
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    item2 = BatchJobItemORM(
        id=item2_id,
        batch_id=batch_id,
        paper_id=paper2_id,
        status="pending",
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    batch_orm = BatchJobORM(
        id=batch_id,
        status="pending",
        total_papers=2,
        completed_papers=0,
        failed_papers=0,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
        items=[item1, item2],
    )

    paper1_orm = PaperORM(id=paper1_id, source="pdf_upload", metadata_={})

    # Mock get_db_context for background tasks
    mock_session = AsyncMock()
    mock_session.get = AsyncMock(side_effect=lambda model, ident, options=None: {
        (BatchJobORM, batch_id): batch_orm,
        (BatchJobItemORM, item1_id): item1,
        (BatchJobItemORM, item2_id): item2,
        (PaperORM, paper1_id): paper1_orm,
        (PaperORM, paper2_id): None,  # paper2 not found -> item2 fails
    }.get((model, ident)))
    mock_session.commit = AsyncMock()

    mock_db_context = MagicMock()
    mock_db_context.__aenter__ = AsyncMock(return_value=mock_session)
    mock_db_context.__aexit__ = AsyncMock(return_value=None)

    db = AsyncMock()
    svc = PipelineService(db)

    with (
        patch("src.services.pipeline_service.get_db_context", return_value=mock_db_context),
        patch.object(svc, "_execute_pipeline_run", new_callable=AsyncMock) as mock_exec,
    ):
        mock_exec.return_value = None
        # Mock run_orm status on re-fetch
        async def mock_get_run(model, ident, options=None):
            from src.db.models import PipelineRunORM
            if model == BatchJobORM:
                return batch_orm
            if model == BatchJobItemORM:
                return item1 if ident == item1_id else item2
            if model == PaperORM:
                return paper1_orm if ident == paper1_id else None
            if model == PipelineRunORM:
                run = PipelineRunORM(id=ident, paper_id=paper1_id, status="completed")
                return run
            return None

        mock_session.get = AsyncMock(side_effect=mock_get_run)

        await svc._execute_batch_job(batch_id, max_concurrency=2)

    assert item1.status == BatchItemStatus.COMPLETED.value
    assert item2.status == BatchItemStatus.FAILED.value
    assert batch_orm.completed_papers == 1
    assert batch_orm.failed_papers == 1
    assert batch_orm.status == BatchJobStatus.PARTIAL.value
