import requests
import time
import os

BASE_URL = "https://www.ecfr.gov/api/versioner/v1"
HEADERS = {"User-Agent": "eCFR-Analyzer/1.0 (carlson2@uci.edu)"}
OUTPUT_DIR = "ecfr_xml"

os.makedirs(OUTPUT_DIR, exist_ok=True)

#Get titles from gov API and collects XML data for each through the API
def download_latest_xml_titles():
    resp = requests.get(f"{BASE_URL}/titles.json", headers=HEADERS)
    titles = resp.json()["titles"]

    for title in titles:
        if title.get("reserved"):
            continue

        title_num = title["number"]
        date = title["latest_issue_date"]

        url = f"{BASE_URL}/full/{date}/title-{title_num}.xml"
        print(f"📥 Downloading Title {title_num} from {date}...")
        r = requests.get(url, headers=HEADERS)

        if r.status_code == 200:
            filename = os.path.join(OUTPUT_DIR, f"title_{title_num}.xml")
            with open(filename, "wb") as f:
                f.write(r.content)
            print(f"Saved to {filename}")
        else:
            print(f"Failed to download Title {title_num}")

        time.sleep(1) # rate limiting

if __name__ == "__main__":
    download_latest_xml_titles()
