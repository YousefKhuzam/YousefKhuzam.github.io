document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM Loaded - Running script.js");

    // 🌙 Dark Mode Toggle (Fix Applied)
    const themeToggle = document.querySelector('.theme-toggle');

    if (!themeToggle) {
        console.error("❌ Theme toggle button not found! Check your HTML.");
    } else {
        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        }

        themeToggle.addEventListener('click', toggleTheme);

        // Apply saved theme on page load
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // 📖 Read More Button Toggle
    document.querySelectorAll(".read-more-btn").forEach(button => {
        button.addEventListener("click", function () {
            let content = this.nextElementSibling;
            if (content && content.classList.contains("read-more-content")) {
                content.classList.toggle("show");
                this.textContent = content.classList.contains("show") ? "Show Less" : "Read More";
            } else {
                console.error("❌ No .read-more-content found after this button.");
            }
        });
    });

    // 📜 Blog Read More Toggle
    const blogReadMore = document.getElementById("full-blog");
    const blogButton = document.querySelector(".read-more-btn");

    if (blogReadMore && blogButton) {
        blogButton.addEventListener("click", function () {
            blogReadMore.style.display = (blogReadMore.style.display === "none" || blogReadMore.style.display === "") ? "block" : "none";
        });
    }

    // 📂 Mobile Menu Toggle
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", function () {
            navLinks.classList.toggle("active");
        });
    } else {
        console.warn("⚠️ Mobile menu elements not found. Skipping menu toggle setup.");
    }

    // 🔄 Smooth Scroll Effect
    document.querySelectorAll("a[href^='#']").forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute("href")).scrollIntoView({
                behavior: "smooth"
            });
        });
    });

    // 📄 CV Popup
    const cvPopup = document.getElementById("cv-popup");
    const closeCVPopup = document.querySelector(".close-btn");
    
    if (cvPopup && closeCVPopup) {
        document.querySelector(".cv-btn").addEventListener("click", function () {
            cvPopup.style.display = "flex";
        });

        closeCVPopup.addEventListener("click", function () {
            cvPopup.style.display = "none";
        });

        window.addEventListener("click", function (event) {
            if (event.target === cvPopup) {
                cvPopup.style.display = "none";
            }
        });
    } else {
        console.warn("⚠️ CV Popup elements not found. Skipping CV popup setup.");
    }

    // 🌐 Particles.js Background
    if (document.getElementById("particles-js")) {
        particlesJS.load('particles-js', 'particles-config.json', function () {
            console.log('✨ Particles.js loaded!');
        });
    } else {
        console.warn("⚠️ Particles.js container not found. Skipping background effect.");
    }
});
