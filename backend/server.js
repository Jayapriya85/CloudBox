 require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const dayjs = require("dayjs");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const BUCKET = process.env.SUPABASE_BUCKET;

const upload = multer({ dest: "/app/Uploads/", limits: { fileSize: 50 * 1024 * 1024 } });

// Static files (frontend)
 app.use(express.static(path.join(__dirname, '../frontend')));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Routes
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });
        
        // Added uploader_id here to receive the secret ID from frontend
        const { genre, tags, expiry, uploader_id } = req.body; 
        const file = req.file;
        const storagePath = `${Date.now()}-${file.originalname}`;
        const fileBuffer = fs.readFileSync(file.path);

        await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, { contentType: file.mimetype });
        
        await supabase.from("files").insert([{
            filename: file.originalname,
            stored_name: storagePath,
            genre: genre || "Others",
            tags: tags ? tags.split(",").map(t => t.trim()) : [],
            size: file.size,
            uploaded_at: new Date().toISOString(),
            expire_at: expiry === "24h" ? dayjs().add(24, "hour").toISOString() : null,
            uploaded_by: "Public",
            uploader_id: uploader_id || "unknown", // Saving it in database
            downloads: 0
        }]);

        fs.unlinkSync(file.path);
        io.emit("activity", { message: `A new ${genre || 'file'} was uploaded: ${file.originalname} 🚀` });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/files", async (req, res) => {
    const { data } = await supabase.from("files").select("*").order("uploaded_at", { ascending: false });
    res.json(data || []);
});

app.get("/download/:name", async (req, res) => {
    try {
        const storedName = req.params.name;

        // 1. Find the file in the database and increment the download count by 1
        const { data: fileData } = await supabase.from("files").select("id, downloads").eq("stored_name", storedName).single();
        
        if (fileData) {
            await supabase.from("files").update({ downloads: fileData.downloads + 1 }).eq("id", fileData.id);
        }

        // 2. Redirect user to the public URL to start download
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storedName);
        res.redirect(urlData.publicUrl);
    } catch (err) {
        console.error("Download error:", err);
        res.status(500).send("Error generating download link");
    }
});

// NEW ROUTE: Delete File Endpoint
app.delete("/delete/:id", async (req, res) => {
    try {
        const fileId = req.params.id;

        // 1. Fetch file details to know what to delete from storage
        const { data: fileData, error: fetchErr } = await supabase.from("files").select("stored_name").eq("id", fileId).single();
        
        if (fetchErr || !fileData) {
            return res.status(404).json({ error: "File not found" });
        }

        // 2. Delete file from Supabase Storage Bucket
        const { error: storageErr } = await supabase.storage.from(BUCKET).remove([fileData.stored_name]);
        if (storageErr) throw storageErr;

        // 3. Delete row from Supabase Database
        const { error: dbErr } = await supabase.from("files").delete().eq("id", fileId);
        if (dbErr) throw dbErr;

        // Notify others that a file was deleted
        io.emit("activity", { message: `A file was removed by its owner. 🗑️` });

        res.json({ success: true });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ error: err.message });
    }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));