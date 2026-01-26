import re
import time
from dataclasses import dataclass
from urllib.parse import urljoin, urlparse

import pandas as pd
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm


BASE = "https://www.docmorris.de"
START = "https://www.docmorris.de/arzneimittel-gesundheit"  # the "Medikamente" entrypoint

HEADERS = {
    "User-Agent": "KinRelay-MVP-Research/0.1 (+contact: you@example.com)",
    "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
}


@dataclass
class Category:
    name: str
    url: str


def get_soup(url: str, session: requests.Session) -> BeautifulSoup:
    r = session.get(url, headers=HEADERS, timeout=30)
    r.raise_for_status()
    return BeautifulSoup(r.text, "html.parser")


def extract_categories(session: requests.Session) -> list[Category]:
    """
    Tries to extract the medication categories from the 'arzneimittel-gesundheit' landing page.
    You may need to adjust selectors if DocMorris changes markup.
    """
    soup = get_soup(START, session)

    cats = []

    # Prefer the sidebar / navigation element that lists categories
    nav = soup.select_one("nav[data-testid='categories-navigation']")
    anchors = nav.select("a[href]") if nav else soup.select("a[href]")

    # Heuristic: find links that look like category entries, e.g. /arzneimittel-gesundheit/allergie
    for a in anchors:
        href = a.get("href", "")
        text = (a.get_text() or "").strip()

        if not text:
            continue

        # Category URLs typically contain /arzneimittel-gesundheit/<slug>
        if "/arzneimittel-gesundheit/" in href:
            full = urljoin(BASE, href)
            # Filter out non-category links a bit
            if re.search(r"/arzneimittel-gesundheit/[a-z0-9-]+/?$", full):
                cats.append(Category(name=text, url=full))

    # Deduplicate by URL
    uniq = {}
    for c in cats:
        uniq[c.url] = c
    cats = list(uniq.values())

    # Optional: keep only the ones that look like the menu names you showed
    # (otherwise you might include many internal links)
    return sorted(cats, key=lambda x: x.name.lower())


def parse_products_from_listing(soup: BeautifulSoup) -> list[dict]:
    """
    Extract products on a category listing page.
    You MUST adjust these selectors once you inspect the HTML.
    """
    products = []

    # Common patterns: product cards with link + title
    # Try a few selector strategies:
    card_selectors = [
        "[data-testid='search-grid-product-card-wrapper']",
        "[data-testid='product-tile']",
        ".product-tile",
        ".ProductTile",
        "article",
    ]

    cards = []
    for sel in card_selectors:
        found = soup.select(sel)
        if len(found) > len(cards):
            cards = found

    # Fallback: try to extract product info from anchors or embedded JSON/structured data
    if not cards:
        # 1) Try to find product entries inside embedded JSON/JSON-LD (Next.js props, ld+json, etc.)
        page_text = str(soup)
        # match patterns like "url":"https://www.docmorris.de/<slug>/<id>" ... "name":"Product Name"
        json_pattern = re.compile(r'"url"\s*:\s*"(https?://www\.docmorris\.de/[^"]+)".*?"name"\s*:\s*"([^"]+)"', re.DOTALL)
        for m in json_pattern.finditer(page_text):
            url = m.group(1)
            name = m.group(2)
            products.append({"name_display": re.sub(r"\s+", " ", name).strip(), "product_url": url})

        # 2) Fallback to any anchor that looks like a product link
        if not products:
            for a in soup.select("a[href]"):
                href = a.get("href", "")
                name = (a.get_text() or "").strip()
                if name and ("/p/" in href or "/produkt/" in href or re.search(r"/[^/]+/\d{5,}", href)):
                    products.append({
                        "name_display": name,
                        "product_url": urljoin(BASE, href),
                    })

        # Normalize and deduplicate
        # filter by product-url pattern
        def _is_product_url(u: str) -> bool:
            try:
                p = urlparse(u)
                return bool(re.search(r"/[^/]+/\d{4,}", p.path))
            except Exception:
                return False

        seen = set()
        uniq = []
        for p in products:
            url = p.get("product_url") or p.get("url")
            if not url or url in seen or not _is_product_url(url):
                continue
            seen.add(url)
            uniq.append({"name_display": p.get("name_display"), "product_url": url})
        return uniq

    for card in cards:
        # Find product link
        a = card.select_one("a[href]")
        if not a:
            continue
        href = a.get("href", "")
        url = urljoin(BASE, href)

        # Find title (varies)
        title_el = (
            card.select_one("[data-testid='product-title']") or
            card.select_one("[data-testid='product-name']") or
            card.select_one(".product-title") or
            card.select_one("h3") or
            card.select_one("h2")
        )
        name = (title_el.get_text() if title_el else a.get_text()).strip()
        name = re.sub(r"\s+", " ", name)

        if name:
            products.append({
                "name_display": name,
                "product_url": url,
            })

    # Deduplicate by product_url
    # Deduplicate and filter by URL pattern (product pages usually end with numeric id)
    def _is_product_url(u: str) -> bool:
        try:
            p = urlparse(u)
            return bool(re.search(r"/[^/]+/\d{4,}", p.path))
        except Exception:
            return False

    seen = set()
    uniq = []
    for p in products:
        url = p.get("product_url")
        if not url or url in seen or not _is_product_url(url):
            continue
        seen.add(url)
        uniq.append(p)
    return uniq


def find_next_page(soup: BeautifulSoup) -> str | None:
    """
    Return next page URL if pagination exists.
    Adjust selectors depending on markup.
    """
    # Common: rel=next
    link = soup.find("link", rel="next")
    if link and link.get("href"):
        return urljoin(BASE, link["href"])

    # Or "next" button
    next_a = soup.select_one("a[aria-label*='Nächste'], a[rel='next']")
    if next_a and next_a.get("href"):
        return urljoin(BASE, next_a["href"])

    return None


def scrape_category_all_products(cat: Category, session: requests.Session, sleep_s: float = 0.8, max_pages: int = 200):
    url = cat.url
    all_products = []
    pages = 0

    while url and pages < max_pages:
        soup = get_soup(url, session)
        products = parse_products_from_listing(soup)
        for p in products:
            p["category"] = cat.name
            p["category_url"] = cat.url
        all_products.extend(products)

        pages += 1
        url = find_next_page(soup)

        time.sleep(sleep_s)

    return all_products


def normalize_active_substance(name_display: str, mapping: dict[str, dict]) -> dict:
    """
    MVP normalization:
    - detect active substance from the product name using a mapping dict (German spellings)
    - returns {active_substance, atc_code, confidence}
    """
    s = name_display.lower()

    # Remove common manufacturer tokens that confuse matching
    s = re.sub(r"\b(adgc|hexal|ratiopharm|al|abz|aristo|axicur|stada)\b", " ", s)
    s = re.sub(r"\s+", " ", s).strip()

    best = None
    for key, val in mapping.items():
        if key in s:
            best = val
            break

    if best:
        return {"active_substance": best["active_substance"], "atc_code": best.get("atc_code"), "confidence": 0.9}

    return {"active_substance": None, "atc_code": None, "confidence": 0.0}


def build_mvp_medications(products_df: pd.DataFrame) -> pd.DataFrame:
    """
    Create a canonical medications list from raw products:
    - one row per (active_substance, atc_code, category)
    - prescription_type stays unknown
    """
    # If there are no products or the expected columns are missing, return empty structures
    if products_df is None or products_df.empty or "name_display" not in products_df.columns:
        empty_out = products_df.copy() if isinstance(products_df, pd.DataFrame) else pd.DataFrame()
        # ensure normalization columns exist
        for col in ("active_substance", "atc_code", "confidence"):
            if col not in empty_out.columns:
                empty_out[col] = None

        meds_cols = [
            "id",
            "name_display",
            "active_substance",
            "atc_code",
            "category",
            "prescription_type",
            "country",
            "source",
            "verified",
            "evidence_count",
        ]
        meds_mvp = pd.DataFrame(columns=meds_cols)
        return empty_out, meds_mvp

    # MVP mapping for allergy (extend later!)
    # Keys are German spellings you expect in product names.
    allergy_map = {
        "cetirizin": {"active_substance": "Cetirizine", "atc_code": "R06AE07"},
        "levocetirizin": {"active_substance": "Levocetirizine", "atc_code": "R06AE09"},
        "loratadin": {"active_substance": "Loratadine", "atc_code": "R06AX13"},
        "desloratadin": {"active_substance": "Desloratadine", "atc_code": "R06AX27"},
        "fexofenadin": {"active_substance": "Fexofenadine", "atc_code": "R06AX26"},
        "bilastin": {"active_substance": "Bilastine", "atc_code": "R06AX29"},
        "mometason": {"active_substance": "Mometasone", "atc_code": "R01AD09"},
        "azelastin": {"active_substance": "Azelastine", "atc_code": "R01AC03"},
        "cromoglicinsäure": {"active_substance": "Cromoglicic acid", "atc_code": "R01AC01"},
        "dimetinden": {"active_substance": "Dimetindene", "atc_code": "R06AB03"},
        # add more as you expand categories
    }

    norm = products_df["name_display"].apply(lambda n: normalize_active_substance(n, allergy_map))
    norm_df = pd.json_normalize(norm)
    out = pd.concat([products_df, norm_df], axis=1)

    # Build canonical meds from matched rows
    meds = out.dropna(subset=["active_substance"]).copy()

    # Map DocMorris category names to your internal category taxonomy
    # (You can expand this mapping for all categories)
    meds["category_internal"] = meds["category"].str.lower().map(lambda x: "allergy" if "allerg" in x else "other")

    # Create medications table rows
    meds_mvp = (
        meds.groupby(["active_substance", "atc_code", "category_internal"], dropna=False)
        .size()
        .reset_index(name="evidence_count")
    )

    meds_mvp["name_display"] = meds_mvp["active_substance"]  # MVP: show substance; later add common strength variants
    meds_mvp["prescription_type"] = "unknown"
    meds_mvp["country"] = "DE"
    meds_mvp["source"] = "manual"  # because we used heuristics; set 'atc' when you import from ATC dataset
    meds_mvp["verified"] = False   # make True only when validated via ATC import or manual review

    # Add an id placeholder (UUID should be generated by DB on insert)
    meds_mvp["id"] = None

    # Order columns like your schema
    meds_mvp = meds_mvp[[
        "id",
        "name_display",
        "active_substance",
        "atc_code",
        "category_internal",
        "prescription_type",
        "country",
        "source",
        "verified",
        "evidence_count"
    ]].rename(columns={"category_internal": "category"})

    return out, meds_mvp


def main():
    with requests.Session() as session:
        cats = extract_categories(session)

        print(f"Found {len(cats)} possible categories.")
        # Optional: filter to the ones you want first (e.g., Allergy only)
        # cats = [c for c in cats if c.name.lower().startswith("allerg")]

        all_rows = []
        for cat in tqdm(cats, desc="Scraping categories"):
            try:
                rows = scrape_category_all_products(cat, session)
                all_rows.extend(rows)
            except Exception as e:
                print(f"[WARN] Failed {cat.name}: {e}")

        products_df = pd.DataFrame(all_rows).drop_duplicates(subset=["product_url"])
        products_df.to_csv("docmorris_products_raw.csv", index=False, encoding="utf-8")
        print(f"Wrote docmorris_products_raw.csv with {len(products_df)} rows.")

        enriched_df, meds_mvp = build_mvp_medications(products_df)
        enriched_df.to_csv("docmorris_products_enriched.csv", index=False, encoding="utf-8")
        meds_mvp.to_csv("kinrelay_medications_mvp.csv", index=False, encoding="utf-8")
        print(f"Wrote kinrelay_medications_mvp.csv with {len(meds_mvp)} canonical meds.")


if __name__ == "__main__":
    main()
