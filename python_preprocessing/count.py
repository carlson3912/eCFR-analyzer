import os
import json
from bs4 import BeautifulSoup
#Reads local XML files and calculates number of words and sections.
#Structure of output allows easy calculation of total counts for agency references
def get_word_counts_by_structure(xml_file_path):
    with open(xml_file_path, 'r', encoding='utf-8') as file:
        soup = BeautifulSoup(file, 'xml')

    results = {}

    subtitles = soup.find_all("DIV2", {"TYPE": "SUBTITLE"})
    if subtitles:
        for subtitle in subtitles:
            sub_id = subtitle.get("N", "UNKNOWN").strip()
            chapters = subtitle.find_all("DIV3", {"TYPE": "CHAPTER"})

            if chapters:
                sub_data = {}
                for chapter in chapters:
                    chap_id = chapter.get("N", "UNKNOWN").strip()
                    text = chapter.get_text(separator=' ')
                    word_count = len(text.split())
                    section_count = len(chapter.find_all("DIV8", {"TYPE": "SECTION"}))
                    sub_data[f"Chapter {chap_id}"] = {
                        "word_count": word_count,
                        "section_count": section_count
                    }
                results[f"Subtitle {sub_id}"] = sub_data
            else:
                text = subtitle.get_text(separator=' ')
                word_count = len(text.split())
                section_count = len(subtitle.find_all("DIV8", {"TYPE": "SECTION"}))
                results[f"Subtitle {sub_id}"] = {
                    "word_count": word_count,
                    "section_count": section_count
                }
    else:
        chapters = soup.find_all("DIV3", {"TYPE": "CHAPTER"})
        for chapter in chapters:
            chap_id = chapter.get("N", "UNKNOWN").strip()
            text = chapter.get_text(separator=' ')
            word_count = len(text.split())
            section_count = len(chapter.find_all("DIV8", {"TYPE": "SECTION"}))
            results[f"Chapter {chap_id}"] = {
                "word_count": word_count,
                "section_count": section_count
            }

    return results

#Loops through all 50 XML files (#35 doesn't exist) and calls get_word_counts_by_structure
def process_all_titles(folder_path="./ecfr_xml"):
    all_data = {}
    for title_num in range(1, 51):
        file_path = os.path.join(folder_path, f"title_{title_num}.xml")
        if not os.path.exists(file_path):
            print(f"File missing: {file_path}")
            continue

        print(f"Processing Title {title_num}...")
        title_data = get_word_counts_by_structure(file_path)
        all_data[f"Title {title_num}"] = title_data

    return all_data

if __name__ == "__main__":
    results = process_all_titles()

    with open("title_stats.json", "w") as f:
        json.dump(results, f, indent=2)
