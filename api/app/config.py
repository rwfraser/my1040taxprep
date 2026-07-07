"""
Application configuration loaded from environment variables.
"""

import os
from pathlib import Path
from functools import lru_cache

from dotenv import load_dotenv

# Load .env file from the api/ directory
load_dotenv(Path(__file__).resolve().parent.parent / ".env")


class Settings:
    # Supabase
    SUPABASE_URL: str = os.environ.get("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.environ.get("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_KEY: str = os.environ.get("SUPABASE_SERVICE_KEY", "")

    # Pipeline paths
    PIPELINE_DIR: Path = Path(
        os.environ.get(
            "PIPELINE_DIR",
            str(Path(__file__).resolve().parent.parent.parent / "my1040taxprep-pipeline"),
        )
    )

    @property
    def SCHEMAS_DET_DIR(self) -> Path:
        return self.PIPELINE_DIR / "schemas_det"

    @property
    def PDFS_DIR(self) -> Path:
        """Root data directory used by the pipeline Config."""
        base = os.environ.get("PIPELINE_BASE_DIR", "")
        if base:
            return Path(base) / "pdfs"
        # Fallback: read from pipeline config
        return Path(r"C:\Users\RogerIdaho\Projects\my1040taxprep") / "pdfs"

    @property
    def PIPELINE_BASE_DIR(self) -> Path:
        base = os.environ.get("PIPELINE_BASE_DIR", "")
        if base:
            return Path(base)
        return Path(r"C:\Users\RogerIdaho\Projects\my1040taxprep")

    # CORS
    CORS_ORIGINS: list[str] = os.environ.get(
        "CORS_ORIGINS", "http://localhost:3000"
    ).split(",")

    # PDF output
    PDF_OUTPUT_DIR: str = os.environ.get("PDF_OUTPUT_DIR", "/tmp/tax_pdfs")


@lru_cache()
def get_settings() -> Settings:
    return Settings()
