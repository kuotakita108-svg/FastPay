"""Convert the previous KuotaKita JSON account store without exposing secrets."""
import argparse
import json
import os
import tempfile


ROLE_MAP = {
    "owner": "master",
    "pengguna": "user",
    "agent": "agent",
    "marketing": "marketing",
    "operator": "operator",
    "analis": "analis",
    "admin": "admin",
}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source")
    parser.add_argument("destination")
    args = parser.parse_args()
    with open(args.source, encoding="utf-8") as handle:
        source = json.load(handle)
    users = source.get("Users") or []
    by_username = {str(row.get("Username", "")).lower(): row for row in users}
    converted = []
    for row in users:
        username = str(row.get("Username", "")).strip().lower()
        if not username:
            continue
        manager_name = ""
        manager_username = str(row.get("MarketingUsername", "")).strip().lower()
        if manager_username in by_username:
            manager_name = str(by_username[manager_username].get("Name", ""))
        converted.append({
            "id": row.get("ID", ""),
            "username": username,
            "name": row.get("Name", ""),
            "role": ROLE_MAP.get(str(row.get("Role", "")).lower(), "user"),
            "balance": 0,
            "phone": row.get("Phone", ""),
            "email": row.get("Email", ""),
            "password_hash": row.get("PasswordHash", ""),
            "created_at": row.get("CreatedAt"),
            "managed_by_id": by_username.get(manager_username, {}).get("ID", ""),
            "managed_by_name": manager_name,
        })
    payload = {"users": converted}
    destination = os.path.abspath(args.destination)
    os.makedirs(os.path.dirname(destination), exist_ok=True)
    descriptor, temporary = tempfile.mkstemp(prefix="accounts-", suffix=".json", dir=os.path.dirname(destination))
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, ensure_ascii=False)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(temporary, 0o600)
        os.replace(temporary, destination)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)
    print(json.dumps({"migrated_users": len(converted), "destination": destination}))


if __name__ == "__main__":
    main()
