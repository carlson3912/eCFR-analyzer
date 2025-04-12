import requests
import json

#Returns Two Objects
#flat_map: each agency in a flat structure with all their references
#parent_to_children: a mapping of parents to their children
def flatten_agency_structure(agencies):
    flat_map = {}
    parent_to_children = {}

    for agency in agencies:
        parent_name = agency.get("name", "unknown")
        cfr_refs = agency.get("cfr_references", [])
        children = agency.get("children", [])

        # Add parent agency references
        if cfr_refs:
            flat_map[parent_name] = [{"title": ref.get("title"), "chapter": ref.get("chapter"), "subtitle": ref.get("subtitle"), "part": ref.get("part")} for ref in cfr_refs]

        # Process children agencies
        child_names = []
        for child in children:
            child_name = child.get("name", "unknown")
            child_names.append(child_name)
            child_refs = child.get("cfr_references", [])
            flat_map[child_name] = [{"title": ref.get("title"), "chapter": ref.get("chapter"), "subtitle": ref.get("subtitle"), "part": ref.get("part") } for ref in child_refs]

        if child_names:
            parent_to_children[parent_name] = child_names

    return flat_map, parent_to_children