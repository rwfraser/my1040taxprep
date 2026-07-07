FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy API code
COPY app/ app/

# Copy pipeline modules needed at runtime
COPY ../my1040taxprep-pipeline/calc_engine.py /pipeline/calc_engine.py
COPY ../my1040taxprep-pipeline/pdf_filler.py /pipeline/pdf_filler.py
COPY ../my1040taxprep-pipeline/config.py /pipeline/config.py
COPY ../my1040taxprep-pipeline/schemas_det/ /pipeline/schemas_det/

ENV PIPELINE_DIR=/pipeline
ENV PYTHONPATH=/app

EXPOSE 8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
