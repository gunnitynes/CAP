// Reads and writes links.json in the CAP repo through the GitHub contents API.
const REPO = "gunnitynes/CAP";
const PATH = "links.json";
const API = `https://api.github.com/repos/${REPO}/contents/${PATH}`;

export const RESERVED = ["admin"];

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

const toB64 = s => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
const fromB64 = b => new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\n/g, "")), c => c.charCodeAt(0)));

export async function load(token) {
  const r = await fetch(API + "?ref=main&t=" + Date.now(), { headers: headers(token), cache: "no-store" });
  if (r.status === 401) throw new Error("That key was rejected by GitHub.");
  if (r.status === 404) throw new Error("That key can't see the CAP repo.");
  if (!r.ok) throw new Error(`GitHub error ${r.status}`);
  const j = await r.json();
  return { links: JSON.parse(fromB64(j.content)), sha: j.sha };
}

async function save(token, links, sha, message) {
  const sorted = Object.fromEntries(Object.entries(links).sort((a, b) => a[0].toLowerCase().localeCompare(b[0].toLowerCase())));
  const r = await fetch(API, {
    method: "PUT",
    headers: headers(token),
    body: JSON.stringify({ message, sha, branch: "main", content: toB64(JSON.stringify(sorted, null, 2) + "\n") }),
  });
  if (r.status === 403 || r.status === 404) throw new Error("That key can read but not write. Give it Contents: Read and write.");
  if (r.status === 409) throw new Error("The list changed elsewhere. Reload and try again.");
  if (!r.ok) throw new Error(`GitHub error ${r.status}`);
  return (await r.json()).content.sha;
}

// Re-reads before every write so two devices never overwrite each other.
export async function setLink(token, name, id, oldName) {
  const { links, sha } = await load(token);
  for (const n of Object.keys(links)) {
    if (n.toLowerCase() === name.toLowerCase() || (oldName && n === oldName)) delete links[n];
  }
  links[name] = id;
  await save(token, links, sha, `Link ${name}`);
  return links;
}

export async function removeLink(token, name) {
  const { links, sha } = await load(token);
  delete links[name];
  await save(token, links, sha, `Remove ${name}`);
  return links;
}

export function cleanName(s) {
  return (s || "").trim().replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Accepts a Gamma share link, embed link, iframe code, or a bare doc id.
export function parseGamma(text) {
  text = (text || "").trim();
  const src = text.match(/src=["']([^"']+)["']/i);
  const titleAttr = text.match(/title=["']([^"']+)["']/i);
  const url = src ? src[1] : text;
  let id = null, title = titleAttr ? titleAttr[1] : "";
  const m = url.match(/gamma\.app\/(?:embed|docs|public|present)\/([^/?#\s]+)/i);
  if (m) {
    const parts = decodeURIComponent(m[1]).split("-");
    id = parts.pop();
    if (!title && parts.length) title = parts.join(" ");
  } else if (/^[a-z0-9]{8,}$/i.test(url)) {
    id = url;
  }
  return id ? { id: id.toLowerCase(), title } : null;
}
