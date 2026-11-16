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
    fontToggleBtn.addEventListener("click", () => {
        document.documentElement.classList.toggle("large-text");
        const isLarge = document.documentElement.classList.contains("large-text");
        fontToggleBtn.textContent = isLarge ? "A-" : "A+";
    });

    const copyEmailBtn = document.getElementById("copyEmailBtn");
    const toast = document.getElementById("toast");

    copyEmailBtn.addEventListener("click", () => {
        const email = "glcoronel1@up.edu.ph";
        navigator.clipboard.writeText(email).then(() => {
            toast.classList.add("toast-show");
            setTimeout(() => toast.classList.remove("toast-show"), 2600);
        });
    });

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

            if (projects.length > 0) {
                projectsGrid.innerHTML = "";
                projects.forEach((project) => {
                    const id = project.getAttribute("id");
                    const title = project.querySelector("title")?.textContent || "";
                    const desc = project.querySelector("description")?.textContent || "";
                    const rawDate = project.querySelector("date")?.textContent || "";
                    const year = rawDate.split("-")[0];

                    const formattedDate = new Date(rawDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    });

                    const imageMarkup = id === "p1"
                        ? `<div class="project-img-wrap">
                               <img src="images/my-project-photo.jpg" alt="A photo of Genesis Faith L. Coronel operating media equipment for church production" width="500">
                           </div>`
                        : "";

                    const article = document.createElement("article");
                    article.className = "project-item";
                    article.setAttribute("data-year", year);
                    article.innerHTML = `
                        <div class="project-header">
                            <h3>${title}</h3>
                            <span class="date-pill">${formattedDate}</span>
                        </div>
                        ${imageMarkup}
                        <p>${desc}</p>
                    `;
                    projectsGrid.appendChild(article);
                });
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
                if (filter === "all" || card.getAttribute("data-year") === filter) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
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
});