document.addEventListener("DOMContentLoaded", () => {
    const reveals = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal-visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    reveals.forEach((el) => revealObserver.observe(el));

    const fontToggleBtn = document.getElementById("fontToggleBtn");
    if (fontToggleBtn) {
        fontToggleBtn.addEventListener("click", () => {
            document.documentElement.classList.toggle("large-text");
            const isLarge = document.documentElement.classList.contains("large-text");
            fontToggleBtn.textContent = isLarge ? "A-" : "A+";
        });
    }

    const copyEmailBtn = document.getElementById("copyEmailBtn");
    const toast = document.getElementById("toast");

    if (copyEmailBtn && toast) {
        copyEmailBtn.addEventListener("click", () => {
            const email = "glcoronel1@up.edu.ph";
            navigator.clipboard.writeText(email).then(() => {
                toast.classList.add("toast-show");
                setTimeout(() => toast.classList.remove("toast-show"), 2600);
            });
        });
    }

    function initProjectSlideshows() {
        const slideshows = document.querySelectorAll(".project-slideshow");
        slideshows.forEach((slideshow) => {
            const slides = slideshow.querySelectorAll(".slide");
            const prevBtn = slideshow.querySelector(".prev");
            const nextBtn = slideshow.querySelector(".next");
            const dotsContainer = slideshow.querySelector(".slide-dots");

            if (slides.length <= 1) {
                if (prevBtn) prevBtn.style.display = "none";
                if (nextBtn) nextBtn.style.display = "none";
                return;
            }

            let currentIndex = 0;
            dotsContainer.innerHTML = "";

            slides.forEach((_, idx) => {
                const dot = document.createElement("button");
                dot.type = "button";
                dot.className = idx === 0 ? "slide-dot active" : "slide-dot";
                dot.setAttribute("aria-label", `Go to photo ${idx + 1}`);
                dot.addEventListener("click", () => goToSlide(idx));
                dotsContainer.appendChild(dot);
            });

            const dots = dotsContainer.querySelectorAll(".slide-dot");

            function goToSlide(index) {
                slides[currentIndex].classList.remove("active");
                dots[currentIndex].classList.remove("active");
                currentIndex = (index + slides.length) % slides.length;
                slides[currentIndex].classList.add("active");
                dots[currentIndex].classList.add("active");
            }

            prevBtn.addEventListener("click", () => goToSlide(currentIndex - 1));
            nextBtn.addEventListener("click", () => goToSlide(currentIndex + 1));
        });
    }

    initProjectSlideshows();

    const projectsGrid = document.getElementById("projects-grid");
    fetch("projects.xml")
        .then((response) => {
            if (!response.ok) throw new Error("XML not fetched via server");
            return response.text();
        })
        .then((xmlString) => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");
            const projects = xmlDoc.querySelectorAll("project");

            if (projects.length > 0 && projectsGrid) {
                projectsGrid.innerHTML = "";
                projects.forEach((project) => {
                    const title = project.querySelector("title")?.textContent || "";
                    const desc = project.querySelector("description")?.textContent || "";
                    const rawDate = project.querySelector("date")?.textContent || "";
                    const year = parseInt(rawDate.split("-")[0], 10);
                    const category = year >= 2025 ? "recent" : "archive";
                    const photos = project.querySelectorAll("photo");

                    const formattedDate = new Date(rawDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    });

                    let slideshowMarkup = "";
                    if (photos.length > 0) {
                        const imgs = Array.from(photos).map((photo, idx) => {
                            const src = photo.textContent.trim();
                            const alt = photo.getAttribute("alt") || title;
                            return `<img src="${src}" alt="${alt}" class="slide${idx === 0 ? " active" : ""}">`;
                        }).join("");

                        slideshowMarkup = `
                            <div class="project-slideshow">
                                <div class="slides-track">${imgs}</div>
                                <button type="button" class="slide-btn prev" aria-label="Previous photo">&#10094;</button>
                                <button type="button" class="slide-btn next" aria-label="Next photo">&#10095;</button>
                                <div class="slide-dots"></div>
                            </div>
                        `;
                    }

                    const article = document.createElement("article");
                    article.className = "project-item";
                    article.setAttribute("data-category", category);
                    article.innerHTML = `
                        <div class="project-header">
                            <h3>${title}</h3>
                            <span class="date-pill">${formattedDate}</span>
                        </div>
                        ${slideshowMarkup}
                        <p>${desc}</p>
                    `;
                    projectsGrid.appendChild(article);
                });

                initProjectSlideshows();
            }
        })
        .catch(() => {
            // Keeps static HTML fallback if opened directly via file://
        });

    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const filter = btn.getAttribute("data-filter");
            const cards = document.querySelectorAll(".project-item");

            cards.forEach((card) => {
                if (filter === "all" || card.getAttribute("data-category") === filter) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });

    const interestCards = document.querySelectorAll(".interest-card");
    interestCards.forEach((card) => {
        const tags = card.querySelectorAll(".tag-interactive");
        const previewBox = card.querySelector(".interest-preview");
        const previewImg = previewBox?.querySelector("img");
        const previewCaption = previewBox?.querySelector(".preview-caption");
        const closeBtn = previewBox?.querySelector(".preview-close");

        if (!previewBox || !previewImg) return;

        tags.forEach((tag) => {
            tag.addEventListener("click", () => {
                const isAlreadyActive = tag.classList.contains("active");

                tags.forEach((t) => t.classList.remove("active"));

                if (isAlreadyActive) {
                    previewBox.classList.remove("open");
                } else {
                    tag.classList.add("active");
                    previewImg.src = tag.getAttribute("data-img");
                    previewImg.alt = tag.getAttribute("data-caption") || tag.textContent;
                    previewCaption.textContent = tag.getAttribute("data-caption") || tag.textContent;
                    previewBox.classList.add("open");
                }
            });
        });

        closeBtn?.addEventListener("click", () => {
            tags.forEach((t) => t.classList.remove("active"));
            previewBox.classList.remove("open");
        });
    });

    const cursorOrb = document.getElementById("cursorOrb");
    if (cursorOrb) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let orbX = mouseX;
        let orbY = mouseY;

        document.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorOrb.style.opacity = "0.95";
        });

        document.addEventListener("mouseleave", () => {
            cursorOrb.style.opacity = "0";
        });

        function animateCursorOrb() {
            orbX += (mouseX - orbX) * 0.12;
            orbY += (mouseY - orbY) * 0.12;
            cursorOrb.style.left = `${orbX}px`;
            cursorOrb.style.top = `${orbY}px`;
            requestAnimationFrame(animateCursorOrb);
        }

        animateCursorOrb();
    }

    const shootingStarsContainer = document.getElementById("shootingStars");
    if (shootingStarsContainer) {
        function spawnShootingStar() {
            const star = document.createElement("span");
            star.className = "shooting-star";

            const startX = Math.random() * (window.innerWidth * 0.85) + window.innerWidth * 0.15;
            const startY = Math.random() * (window.innerHeight * 0.85);
            const tailLength = Math.floor(Math.random() * 80) + 70;

            star.style.left = `${startX}px`;
            star.style.top = `${startY}px`;
            star.style.width = `${tailLength}px`;

            shootingStarsContainer.appendChild(star);

            star.addEventListener("animationend", () => {
                star.remove();
            });
        }

        setTimeout(spawnShootingStar, 1200);
        setInterval(() => {
            if (!document.hidden) {
                spawnShootingStar();
            }
        }, 3800);
    }
});