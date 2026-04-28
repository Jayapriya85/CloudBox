/* ---------------- IDENTITY SETUP (For Delete Option) ---------------- */
// Generate a unique ID for the user's browser if it doesn't exist
let myUploaderId = localStorage.getItem("cloudbox_user_id");
if (!myUploaderId) {
    myUploaderId = "user_" + Math.random().toString(36).substr(2, 10);
    localStorage.setItem("cloudbox_user_id", myUploaderId);
}

/* ---------------- INITIALIZE SOCKET.IO ---------------- */
const socket = io();

// DOM Elements
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadFile");
const fileList = document.getElementById("fileList");
const progressBar = document.getElementById("progressBar");
const progressContainer = document.getElementById("progressContainer");

const toggleSidebar = document.getElementById("toggleSidebar");
const sidebar = document.getElementById("sidebar");
const genreSelect = document.getElementById("genreSelect");
const otherGenreInput = document.getElementById("otherGenreInput");

const navHome = document.getElementById("navHome");
const navShared = document.getElementById("navShared");
const homeSection = document.getElementById("homeSection");
const sharedSection = document.getElementById("sharedSection");

/* ---------------- UI LOGIC & NAVIGATION ---------------- */
if (toggleSidebar) {
    toggleSidebar.addEventListener("click", () => {
        sidebar.classList.toggle("-ml-64"); 
    });
}

navHome.addEventListener("click", () => {
    homeSection.classList.remove("hidden");
    sharedSection.classList.add("hidden");
    navHome.classList.add("bg-white/10"); // Active state
    navShared.classList.remove("bg-white/10");
});

navShared.addEventListener("click", () => {
    homeSection.classList.add("hidden");
    sharedSection.classList.remove("hidden");
    navShared.classList.add("bg-white/10"); // Active state
    navHome.classList.remove("bg-white/10");
});

if (genreSelect) {
    genreSelect.addEventListener("change", (e) => {
        if (e.target.value === "Others") {
            otherGenreInput.classList.remove("hidden");
        } else {
            otherGenreInput.classList.add("hidden");
            otherGenreInput.value = ""; 
        }
    });
}

/* ---------------- FILTER LOGIC ---------------- */
const filterBtns = document.querySelectorAll(".filter-btn");

filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        filterBtns.forEach(b => {
            b.classList.remove("bg-indigo-600", "text-white", "shadow-md");
            b.classList.add("bg-gray-100", "text-gray-600");
        });
        btn.classList.remove("bg-gray-100", "text-gray-600");
        btn.classList.add("bg-indigo-600", "text-white", "shadow-md");

        const filterValue = btn.getAttribute("data-filter");
        const allFiles = document.querySelectorAll(".file-item");

        allFiles.forEach(file => {
            const fileGenre = file.getAttribute("data-genre");
            if (filterValue === "All" || fileGenre === filterValue) {
                file.style.display = "flex";
            } else {
                file.style.display = "none";
            }
        });
    });
});

/* ---------------- LOAD ALL FILES ---------------- */
async function loadFiles() {
    if (!fileList) return; 
    try {
        const res = await fetch("/files");
        const files = await res.json();
        fileList.innerHTML = "";

        if (!files || files.length === 0) {
            fileList.innerHTML = "<p class='text-gray-500 text-center col-span-full py-8 font-medium'>No files shared yet. Be the first! ✨</p>";
            return;
        }

        files.forEach((file, index) => {
            const dlCount = file.downloads || 0; 
            
            // Check if current user uploaded this file
            const isOwner = file.uploader_id === myUploaderId; 
            
            // Create Delete button HTML conditionally
            const deleteBtnHtml = isOwner ? 
                `<button onclick="deleteFile('${file.id}')" class="text-red-500 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors ml-2" title="Delete your file">🗑️</button>` : '';

            const li = document.createElement("li");
            // Add animation delay so they load one by one smoothly
            li.style.animationDelay = `${index * 0.05}s`;
            li.className = "file-item animate-fade-in flex flex-col justify-between border border-gray-100 p-5 rounded-2xl bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300";
            li.setAttribute("data-genre", file.genre || "Others"); 

            li.innerHTML = `
                <div class="mb-4">
                    <span class="font-bold text-gray-800 text-lg block truncate" title="${file.filename}">${file.filename || "Unknown File"}</span>
                    <div class="mt-2 flex items-center gap-2 flex-wrap">
                        <span class="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full">${file.genre || "Others"}</span>
                        <span class="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">📥 ${dlCount}</span>
                    </div>
                </div>
                <div class="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                    <a href="/download/${file.stored_name}" 
                       target="_blank" 
                       class="flex-1 text-center bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md px-4 py-2.5 rounded-xl font-bold transition-all text-sm">
                       Download
                    </a>
                    ${deleteBtnHtml}
                </div>
            `;
            fileList.appendChild(li);
        });
    } catch (err) {
        console.error("Error loading files:", err);
    }
}

/* ---------------- UPLOAD FILE LOGIC ---------------- */
if (uploadBtn) {
    uploadBtn.onclick = async () => {
        const file = fileInput.files[0];
        if (!file) return alert("Please select a file first!");

        let finalGenre = genreSelect.value;
        if (finalGenre === "Others" && otherGenreInput.value.trim() !== "") {
            finalGenre = otherGenreInput.value.trim();
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("genre", finalGenre);
        
        // ✨ Send the Secret ID to Backend so it knows YOU uploaded it
        formData.append("uploader_id", myUploaderId); 

        progressContainer.classList.remove("hidden"); 

        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = e => {
            if (e.lengthComputable && progressBar) {
                const percent = (e.loaded / e.total) * 100;
                progressBar.style.width = percent + "%";
            }
        };

        xhr.open("POST", "/upload");
        xhr.onload = () => {
            progressContainer.classList.add("hidden"); 
            progressBar.style.width = "0%";
            
            if (xhr.status === 200) {
                // Remove alert for better UI, just show visual feedback or reset
                fileInput.value = ""; 
                otherGenreInput.value = ""; 
                genreSelect.value = "Education";
                otherGenreInput.classList.add("hidden");
                loadFiles(); 
                
                // Switch to Shared Files view automatically
                navShared.click();
            } else {
                alert("Upload Failed. Check backend.");
            }
        };
        xhr.send(formData);
    };
}

/* ---------------- DELETE FILE LOGIC ---------------- */
// Frontend function to call backend delete endpoint
async function deleteFile(fileId) {
    if(!confirm("Are you sure you want to delete this file?")) return;
    
    try {
        const res = await fetch(`/delete/${fileId}`, { method: 'DELETE' });
        if(res.ok) {
            loadFiles(); // Refresh list after delete
        } else {
            alert("Error deleting file.");
        }
    } catch (error) {
        console.error("Delete failed", error);
    }
}

/* ---------------- SOCKET EVENTS (LIVE) ---------------- */
socket.on("activity", data => {
    const feed = document.getElementById("activityFeed");
    if (feed) {
        const li = document.createElement("li");
        li.className = "text-sm text-gray-700 bg-blue-50/50 p-3 rounded-xl mb-2 border border-blue-100 shadow-sm animate-fade-in";
        li.innerHTML = `<strong>⚡ Update:</strong> ${data.message}`;
        
        // Remove the "Waiting..." text if it exists
        if(feed.children.length === 1 && feed.children[0].innerText.includes("Waiting")) {
            feed.innerHTML = "";
        }
        
        feed.prepend(li); 
    }
});

socket.on("activeUsers", count => {
    const userCount = document.getElementById("activeUsers");
    if (userCount) userCount.innerText = count;
});

// Initial Load
loadFiles();