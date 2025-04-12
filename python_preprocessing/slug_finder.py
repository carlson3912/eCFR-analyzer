import json
# Recursively extract all slugs from an agency and its children.
def extract_slugs(agency):
    slugs = [agency.get("slug")]
    for child in agency.get("children", []):
        slugs.extend(extract_slugs(child))
    return slugs

# Script to get slugs for every agency. Used for dropdown table.
def main():
    input_path = "agencies_raw.json"

    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    all_slugs = []
    for agency in data.get("agencies", data): 
        all_slugs.extend(extract_slugs(agency))

    flat_slugs = sorted(set(filter(None, all_slugs)))

    with open("agency_slugs.json", "w", encoding="utf-8") as f:
        json.dump(flat_slugs, f, indent=2)

    print(f"Extracted {len(flat_slugs)} unique slugs")

if __name__ == "__main__":
    main()
