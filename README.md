# ☁️ CloudBox - Cloud-Native File Sharing Platform

> A modern, serverless, and containerized file-sharing application designed to eliminate environment inconsistencies and streamline cloud deployments.

## 🚀 Overview
CloudBox is a fully automated DevOps-centric project that shifts the paradigm from traditional server-based file management to a modern cloud-native ecosystem. By leveraging Docker for containerization and Supabase as a Backend-as-a-Service (BaaS), it ensures zero-downtime, high availability, and a frictionless "works anywhere" deployment model.

## ✨ Key Features
- **Containerized Environment:** Built with Docker to guarantee exact functional parity across local and production stages.
- **Serverless Data Management:** Utilizes Supabase Storage Buckets and PostgreSQL for secure, real-time file metadata and physical file tracking.
- **Continuous Deployment (CI/CD):** Seamlessly hosted on Render (PaaS), enabling automated deployments directly from the GitHub repository.
- **Responsive UI:** A clean, intuitive frontend built with Tailwind CSS for seamless interactions across all devices.

## 🏛️ System Architecture

     [ User Devices ] ──> [ Frontend Client (HTML/CSS/JS) ]
                                  │
                                  ▼
      [ RENDER PaaS ] ──> [ Docker Container: Node.js Backend ]
                                  │
                                  ▼
     [ SUPABASE BaaS ] ──> [ PostgreSQL DB & Storage Bucket ]

## 🛠️ Technology Stack
| Category | Technologies / Tools |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, Tailwind CSS, JavaScript (ES6) |
| **Backend API** | Node.js, Express.js |
| **Database & Storage** | Supabase (PostgreSQL, Storage Buckets) |
| **Containerization**| Docker, Dockerfile |
| **Version Control** | Git, GitHub |
| **Hosting (PaaS)**| Render |

## ⚙️ Getting Started (Local Development)

Follow these steps to set up and run CloudBox on your local machine using Docker.

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/get-started) installed.
- [Git](https://git-scm.com/) installed.
- A [Supabase](https://supabase.com/) account with a created project and storage bucket.


1. Clone the Repository
    git clone https://github.com/YourUsername/CloudBox.git
    cd CloudBox

 2. Configure Environment Variables
Create a `.env` file in the root directory and add your Supabase credentials:
    PORT=5000
    SUPABASE_URL=your_supabase_project_url
    SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_BUCKET_NAME=your_bucket_name

 3. Build and Run via Docker
To build the Docker image and start the container, run:
    docker build -t cloudbox-app .
    docker run -p 5000:5000 --env-file .env cloudbox-app

The application will now be running on http://localhost:5000

## 🔮 Future Enhancements
- **Advanced RBAC:** Implement Role-Based Access Control for Admin, Editor, and Viewer privileges.
- **AI Malware Scanning:** Serverless functions to sanitize files during the upload stream.
- **File Versioning:** Automatically preserve older iterations of overwritten files.

## 👨‍💻 Author
**JAYAPRIYA RAVICHANDRAN**  
*Aspiring Cloud & DevOps Engineer*  
[LinkedIn Profile](https://linkedin.com/in/Jayapriya85) 
