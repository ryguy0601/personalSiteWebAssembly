window.initVanillaTilt = () => {
    document.querySelectorAll(".card").forEach(function (card) {
        card.setAttribute("data-tilt", "");
        card.setAttribute("data-tilt-max", "-8");
        card.setAttribute("data-tilt-speed", "400");
        card.setAttribute("data-tilt-scale", "1.02");
    });

    VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
        glare: true,
        "max-glare": 0.2
    });
};

window.initMatrix = () => {
    const canvas = document.getElementById("matrix-canvas");
    const ctx = canvas.getContext("2d");

    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    const letters = "\\|/?><,.{}[]:;'\"$!#()%^&*ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize);

    let drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = { y: Math.random() * canvas.height / fontSize, velocity: 1, drift: 0 };
    }

    let mouse = { x: -1000, y: -1000 };
    let mouseInside = true;

    document.addEventListener("mouseout", (e) => {
        // If mouse left the window entirely
        if (!e.relatedTarget && !e.toElement) {
            mouseInside = false;
            mouse.x = -1000;
            mouse.y = -1000;
        }
    });

    document.addEventListener("mouseover", () => {
        mouseInside = true;
    });

    document.addEventListener("mousemove", (e) => {
        if (!mouseInside) return;
        const hoveredElement = document.elementFromPoint(e.clientX, e.clientY);
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    function draw() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = fontSize + "px monospace";

        for (let i = 0; i < drops.length; i++) {
            const drop = drops[i];
            const text = letters[Math.floor(Math.random() * letters.length)];
            const xPos = i * fontSize + drop.drift;
            const yPos = drop.y * fontSize;

            // Calculate color based on vertical position
            const progress = Math.min(yPos / canvas.height, 1); // 0 at top, 1 at bottom
            const r = Math.floor(255 * (.5 - progress)); // fades from 255 → 0
            const g = Math.floor(255 * (progress));;
            const b = Math.floor(255 * (0)); // fades from 0 → 255
            ctx.fillStyle = `rgb(${r},${g},${b})`;

            ctx.fillText(text, xPos, yPos);

            if (mouseInside) {
                const dx = xPos - mouse.x;
                const dy = yPos - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const repelRadius = 50;

                if (dist < repelRadius) {
                    const direction = Math.random() < 0.5 ? -1 : 1;
                    drop.drift += direction * (repelRadius * 0.5);
                    drop.y -= 1;
                } else {
                    drop.y += drop.velocity;
                    drop.drift *= -1.01;
                }
            } else {
                drop.y += drop.velocity;
                drop.drift *= 0.9;
            }

            if (drop.y * fontSize > canvas.height && Math.random() > 0.975) {
                drop.y = 0;
                drop.drift = 0;
            }
        }
    }

    setInterval(draw, 33);

    window.addEventListener("resize", () => {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        columns = Math.floor(canvas.width / fontSize);
        drops = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = { y: Math.random() * canvas.height / fontSize, velocity: 1, drift: 0 };
        }
    });
};


window.navFuncs = () => {
    const sidebar = document.getElementById("sidebar");
    const navToggleButton = document.getElementById("nav-toggle");
    const closeBtn = document.getElementById("sideNavClose");

    // Highlight active link
    const navLinks = document.querySelectorAll(".nav-link");
    const currentUrl = window.location.pathname;
    //navLinks.forEach(link => {
    //    let linkUrl = new URL(link.getAttribute("href"), window.location.origin);
    //    if (linkUrl.pathname === currentUrl) {
    //        navLinks.forEach(l => l.classList.remove("active"));
    //        link.classList.add("active");
    //    }
    //});

    // Toggle sidebar on button click
    navToggleButton.addEventListener("click", () => {
        sidebar.classList.toggle("show");
    });

    // Close button for mobile
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            sidebar.classList.remove("show");
        });
    }

    navToggleButton.addEventListener("mouseenter", () => {
        if (window.innerWidth >= 576) {
            console.log('test')
            sidebar.classList.add("show");
        }
    });

    // Sidebar + multiple submenus hover handling
    document.addEventListener("mousemove", (e) => {
        if (window.innerWidth >= 576) {
            const sidebarRect = sidebar.getBoundingClientRect();

            let insideSidebar = (
                e.clientX >= sidebarRect.left - 10 &&
                e.clientX <= sidebarRect.right + 10 &&
                e.clientY >= sidebarRect.top - 10 &&
                e.clientY <= sidebarRect.bottom + 10
            );

            // check ALL submenus
            const submenus = document.querySelectorAll(".submenu");
            let insideAnySubmenu = false;

            submenus.forEach(sm => {
                const smRect = sm.getBoundingClientRect();
                if (
                    e.clientX >= smRect.left - 10 &&
                    e.clientX <= smRect.right + 10 &&
                    e.clientY >= smRect.top - 10 &&
                    e.clientY <= smRect.bottom + 10
                ) {
                    insideAnySubmenu = true;
                }
            });
            let smRect = navToggleButton.getBoundingClientRect();
            if (e.clientX >= smRect.left - 10 &&
                e.clientX <= smRect.right + 10 &&
                e.clientY >= smRect.top - 10 &&
                e.clientY <= smRect.bottom + 10
            ) {
                insideAnySubmenu = true;
            }

            if (e.clientX <= 10 || insideSidebar || insideAnySubmenu) {
                sidebar.classList.add("show");
            } else {
                sidebar.classList.remove("show");
            }
        }
    });
}