"""
pipeline.tests.unit.test_auth
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Unit tests for authentication dependency (get_current_user).
"""

from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from src.api.dependencies import get_current_user


@pytest.mark.asyncio
async def test_get_current_user_with_bearer_token():
    mock_supabase = MagicMock()
    mock_supabase.auth.get_user.return_value.user.id = "user-123"

    with patch("src.api.dependencies.get_auth_client", return_value=mock_supabase):
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials="valid-token"
        )
        user_id = await get_current_user(credentials=credentials)
        assert user_id == "user-123"
        mock_supabase.auth.get_user.assert_called_once_with("valid-token")


@pytest.mark.asyncio
async def test_get_current_user_no_credentials_raises_401():
    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(credentials=None)
    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Not authenticated"
