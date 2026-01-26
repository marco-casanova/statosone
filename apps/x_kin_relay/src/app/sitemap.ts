export default function sitemap() {
  const base = "https://kinrelay.com";
  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/investors`, lastModified: new Date() },
  ];
}
