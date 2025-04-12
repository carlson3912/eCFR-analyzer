from agencies import flatten_agency_structure
from count import process_all_titles
import requests
import json

def summarize_agency_totals(agency_refs, parent_children_map, title_stats):
    raw_totals = {}

    # Step 1: Calculate totals per agency (raw only)
    for agency, refs in agency_refs.items():
        total_words = 0
        total_sections = 0

        for ref in refs:
            title = ref["title"]
            chapter = ref.get("chapter")
            subtitle = ref.get("subtitle")

            title_key = f"Title {title}"
            if title_key not in title_stats:
                print("title not found", ref)
                continue

            title_data = title_stats[title_key]

            entry = None

            # Case 1: Subtitle and Chapter provided
            if subtitle and chapter:
                subtitle_key = f"Subtitle {subtitle}"
                chapter_key = f"Chapter {chapter}"
                entry = title_data.get(subtitle_key, {}).get(chapter_key)

            # Case 2: Chapter only, and it's at the top level
            elif chapter:
                chapter_key = f"Chapter {chapter}"
                entry = title_data.get(chapter_key)

                # Case 3: Chapter may be nested under any subtitle
                if not entry:
                    for sub_data in title_data.values():
                        if isinstance(sub_data, dict) and chapter_key in sub_data:
                            entry = sub_data[chapter_key]
                            break

            # Case 4: Subtitle only (no chapter)
            elif subtitle:
                subtitle_key = f"Subtitle {subtitle}"
                sub_data = title_data.get(subtitle_key)

                if isinstance(sub_data, dict):
                    # Check if subtitle directly has word/section count (this occurent when it has parts underneath, not chapters)
                    if "word_count" in sub_data and "section_count" in sub_data:
                        total_words += sub_data.get("word_count", 0)
                        total_sections += sub_data.get("section_count", 0)
                    else:
                        for chapter_name, chapter_data in sub_data.items():
                            if isinstance(chapter_data, dict):
                                total_words += chapter_data.get("word_count", 0)
                                total_sections += chapter_data.get("section_count", 0)

                entry = None

            # Generic entry handler for Cases 1–3
            if entry:
                try:
                    total_words += entry["word_count"]
                    total_sections += entry["section_count"]
                except Exception as e:
                    print("entry error", ref, agency)

        raw_totals[agency] = {
            "words": total_words,
            "sections": total_sections,
            "references": refs
        }

    # Step 2: Aggregate children into parent records
    final_totals = {}

    for parent_agency in set(list(raw_totals.keys()) + list(parent_children_map.keys())):
        parent_data = raw_totals.get(parent_agency, {"words": 0, "sections": 0, "references": []})
        children_list = []
        child_words = 0
        child_sections = 0

        for child in parent_children_map.get(parent_agency, []):
            child_data = raw_totals.get(child, {"words": 0, "sections": 0})
            children_list.append({
                "agency": child,
                "words": child_data["words"],
                "sections": child_data["sections"]
            })
            child_words += child_data["words"]
            child_sections += child_data["sections"]

        # Parent total is parent alone + children
        total_words = parent_data["words"] + child_words
        total_sections = parent_data["sections"] + child_sections

        final_totals[parent_agency] = {
            "words": total_words,
            "sections": total_sections,
            "children": children_list,
            "references": parent_data["references"] 
        }

    return final_totals

if __name__ == "__main__":
    url = "https://www.ecfr.gov/api/admin/v1/agencies.json"
    response = requests.get(url)
    response.raise_for_status()

    data = response.json()
    agencies = data.get("agencies", [])

    agency_refs, parent_children_map = flatten_agency_structure(agencies)
    section_count = process_all_titles()
    summary = summarize_agency_totals(agency_refs, parent_children_map, section_count)

    with open("agency_summary.json", "w") as f:
        json.dump(summary, f, indent=2)
