"""
backup_to_s3.py
----------------
Exports all MongoDB contact form submissions to a JSON file
and uploads it to AWS S3 as a timestamped backup.

This demonstrates:
- Python scripting
- MongoDB/pymongo usage
- AWS S3 with boto3
- Environment variable best practices

Usage:
    pip install pymongo boto3 python-dotenv
    python scripts/backup_to_s3.py

Required env vars (reads from backend/.env automatically):
    MONGO_URI       — MongoDB Atlas connection string
    S3_LOG_BUCKET   — S3 bucket name (default: personalityweb-logs)
    AWS_REGION      — AWS region     (default: us-east-1)
"""

import os
import json
import datetime
from pathlib import Path

import boto3
from pymongo import MongoClient
from dotenv import load_dotenv

# Load backend/.env so you don't have to set vars manually during development
env_path = Path(__file__).resolve().parent.parent / "backend" / ".env"
load_dotenv(env_path)

# ── Config ────────────────────────────────────────────────────────────────────
MONGO_URI   = os.environ.get("MONGO_URI")
S3_BUCKET   = os.environ.get("S3_LOG_BUCKET", "personalityweb-logs")
AWS_REGION  = os.environ.get("AWS_REGION", "us-east-1")
DB_NAME     = "personalityweb"
COLLECTION  = "contacts"


def fetch_contacts(mongo_uri: str) -> list[dict]:
    """Connect to MongoDB and return all contact documents."""
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    db = client[DB_NAME]
    docs = list(db[COLLECTION].find({}, {"_id": 0}))  # exclude _id for clean JSON
    client.close()
    return docs


def upload_to_s3(s3_client, bucket: str, data: list[dict]) -> str:
    """Upload the backup JSON to S3 and return the S3 key."""
    timestamp = datetime.datetime.utcnow().strftime("%Y/%m/%d/%H%M%S")
    key = f"backups/contacts/{timestamp}.json"

    s3_client.put_object(
        Bucket=bucket,
        Key=key,
        Body=json.dumps(data, indent=2, default=str),
        ContentType="application/json",
    )
    return key


def main():
    if not MONGO_URI:
        raise EnvironmentError("MONGO_URI is not set. Check backend/.env")

    print(f"[1] Connecting to MongoDB...")
    contacts = fetch_contacts(MONGO_URI)
    print(f"  Found {len(contacts)} contact record(s).")

    if not contacts:
        print("  Nothing to back up.")
        return

    print(f"[2] Uploading backup to s3://{S3_BUCKET}...")
    s3 = boto3.client("s3", region_name=AWS_REGION)
    key = upload_to_s3(s3, S3_BUCKET, contacts)
    print(f"  Backup saved → s3://{S3_BUCKET}/{key}")

    print("\nBackup complete.")


if __name__ == "__main__":
    main()
