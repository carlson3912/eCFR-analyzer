# eCFR Analyzer

Analyzes the Code of Federal Regulations (eCFR) using the API described at:  
https://www.ecfr.gov/developers/documentation/api/v1#/

Live demo:  
https://peppy-cannoli-580ad8.netlify.app/

---

## Project Structure

### 1. `python_preprocessing/`
Parses XML and JSON from the eCFR API and generates three output files consumed by the frontend:

- `agency_slugs.json`: List of 316 agency slugs for the dropdown menu
- `agency_summary.json`: Word and Section count per agency (used in the table)
- `title_stats.json`: Word and Section count per Title (used in the pie chart)

### 2. `react-client/`
Frontend built with React. Renders interactive dashboards, charts, and custom metrics using the JSON files from the Python preprocessing step.

---

## Basic Metrics

- **Word and Section Count per Agency**  
  Visualized in a sortable table.

- **Relative Size of Titles**  
  Rendered as a Pie Chart showing each Title’s share of total CFR content.

---

## Custom Metrics

### Custom Metric 1: Change in the Number of Regulations Over Time
Tracks how many unique regulations use a given keyword or phrase (e.g., "artificial intelligence", "cryptocurrency").  
Why it matters: Reveals trends in regulatory focus and highlights potential over-regulation in specific domains.

### Custom Metric 2: Rate of New Regulations Before and After DOGE
Compares the rate of new regulation creation before and after the inception of DOGE.  
Why it matters: If DOGE can't decrease the number of regulations, it can at least aim to reduce the rate in which they are created.

## Technologies Used

- Python (lxml, BeautifulSoup, requests)
- React + MUI (Material UI) for frontend
- CanvasJS for rendering charts
- eCFR API (v1)

---

## To Run Locally

```bash
git clone https://github.com/YOUR_USERNAME/ecfr-analyzer.git
cd ecfr-analyzer
