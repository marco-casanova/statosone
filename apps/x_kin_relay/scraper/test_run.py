import importlib.util
import requests

spec = importlib.util.spec_from_file_location("scraper_mod", "scraper/scraper.py")
sc = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sc)

s = sc.get_soup(sc.START, requests.Session())
prods = sc.parse_products_from_listing(s)
print('found', len(prods), 'products')
for p in prods[:10]:
    print(p)
