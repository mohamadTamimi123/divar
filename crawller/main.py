import requests

url = "https://api.divar.ir/v8/web-search/karaj/real-estate"

headers = {
    "User-Agent": "Android App/9.8.0 (com.divar; build:9800; Android 12)",
    "Content-Type": "application/json",
    "Accept": "application/json"
}

payload = {
    "json_schema": {
        "category": {"value": "real-estate"}
    },
    "last-post-date": 0
}

res = requests.post(url, json=payload, headers=headers)

print(res.status_code)
print(res.text[:1000])  # برای بررسی خروجی
