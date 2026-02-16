# AI Smart Gallery 📸
A full-stack, containerized web application that uses Artificial Intelligence to automatically tag and organize images. Built with the MERN stack and deployed via Docker.

---

## 🚀 Key Features
* **AI-Driven Object Detection**: Integrates the **Hugging Face Inference API** to analyze uploaded images and automatically generate descriptive metadata tags (e.g., animals, furniture, electronics).
* **MERN Stack Architecture**: Built with a **React** frontend, **Node.js/Express** backend, and **MongoDB Atlas** for persistent cloud storage.
* **Containerized Workflow**: Fully dockerized environment for seamless deployment, ensuring the app runs identically across different operating systems.
* **Persistent Data Bridging**: Implements **Docker Volumes** to synchronize local host-machine uploads with the containerized server environment.
* **Glassmorphic Design**: A modern, responsive UI featuring real-time tag-based search and interactive gallery cards.

---

## 🛠️ Technical Stack
* **AI Service**: Hugging Face Inference API (Computer Vision)
* **Frontend**: React.js, CSS Glassmorphism
* **Backend**: Node.js, Express.js
* **Database**: MongoDB Atlas
* **DevOps**: Docker
* **Libraries**: Multer (file handling), Mongoose (ODM), Axios

---

## Screenshots
* **SmartGallery**:
![Main Gallery](./client/src/assests/Maingallery.png)

* **Search feature**:
![Search Feature](./client/src/assests/search.png)