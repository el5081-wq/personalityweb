"""
aws_health_check.py
--------------------
Checks that the EC2 instance running personalityweb is healthy.
- Queries AWS for the instance state
- Hits the /api/health endpoint
- Logs the result to an S3 bucket (free tier)

Usage:
    pip install boto3 requests
    python scripts/aws_health_check.py

Required env vars (or AWS CLI configured via: aws configure):
    AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY
    AWS_REGION         (default: us-east-1)
    APP_INSTANCE_TAG   (default: personalityweb-server)
    S3_LOG_BUCKET      (default: personalityweb-logs)
"""

import os
import json
import datetime
import boto3
import requests

# ── Config ────────────────────────────────────────────────────────────────────
REGION       = os.environ.get("AWS_REGION", "us-east-1")
INSTANCE_TAG = os.environ.get("APP_INSTANCE_TAG", "personalityweb-server")
S3_BUCKET    = os.environ.get("S3_LOG_BUCKET", "personalityweb-logs")
APP_PORT     = os.environ.get("APP_PORT", "5000")


def get_instance_ip(ec2_client, tag_name: str) -> str | None:
    """Return the public IP of the running EC2 instance with the given Name tag."""
    response = ec2_client.describe_instances(
        Filters=[
            {"Name": "tag:Name",         "Values": [tag_name]},
            {"Name": "instance-state-name", "Values": ["running"]},
        ]
    )
    reservations = response.get("Reservations", [])
    if not reservations:
        return None
    return reservations[0]["Instances"][0].get("PublicIpAddress")


def check_app_health(ip: str, port: str) -> dict:
    """Hit the /api/health endpoint and return the result."""
    url = f"http://{ip}:{port}/api/health"
    try:
        resp = requests.get(url, timeout=10)
        return {"url": url, "status_code": resp.status_code, "body": resp.json()}
    except requests.RequestException as exc:
        return {"url": url, "error": str(exc)}


def upload_log(s3_client, bucket: str, log: dict) -> None:
    """Upload a JSON log entry to S3 with a timestamped key."""
    timestamp = datetime.datetime.utcnow().strftime("%Y/%m/%d/%H%M%S")
    key = f"health-checks/{timestamp}.json"
    s3_client.put_object(
        Bucket=bucket,
        Key=key,
        Body=json.dumps(log, indent=2),
        ContentType="application/json",
    )
    print(f"  Log uploaded → s3://{bucket}/{key}")


def main():
    ec2 = boto3.client("ec2", region_name=REGION)
    s3  = boto3.client("s3",  region_name=REGION)

    print(f"[1] Looking up EC2 instance: {INSTANCE_TAG}")
    ip = get_instance_ip(ec2, INSTANCE_TAG)
    if not ip:
        print("  ERROR: No running instance found.")
        return

    print(f"  Found instance at {ip}")

    print(f"[2] Checking app health at port {APP_PORT}")
    result = check_app_health(ip, APP_PORT)
    print(f"  Result: {result}")

    log_entry = {
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "instance_ip": ip,
        "health": result,
    }

    print(f"[3] Uploading log to S3 bucket: {S3_BUCKET}")
    try:
        upload_log(s3, S3_BUCKET, log_entry)
    except Exception as exc:
        print(f"  WARNING: Could not upload log — {exc}")

    print("\nDone.")


if __name__ == "__main__":
    main()
