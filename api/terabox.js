import fetch from "node-fetch";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Terabox URL required" });
  }

  try {
    // STEP 1: get file info
    const fileRes = await fetch(
      `https://terabox-api-nt-sable.vercel.app/generate_file?url=${encodeURIComponent(url)}`
    );
    const fileData = await fileRes.json();

    if (!fileData || !fileData.list || fileData.list.length === 0) {
      return res.status(400).json({ error: "Invalid Terabox link" });
    }

    const f = fileData.list[0];

    // STEP 2: generate download link
    const linkRes = await fetch(
      `https://terabox-api-nt-sable.vercel.app/generate_link?fs_id=${f.fs_id}&shareid=${fileData.shareid}&uk=${fileData.uk}&sign=${fileData.sign}&timestamp=${fileData.timestamp}`
    );

    const linkData = await linkRes.json();

    return res.json({
      filename: f.filename,
      size: f.size,
      type: f.is_dir ? "folder" : "file",
      download_url: linkData.download_url || linkData.direct_link
    });

  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
