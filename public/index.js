document.addEventListener("DOMContentLoaded", () => {
    cargarCategorias();
    cargarProductos();

    document.getElementById('buscar').addEventListener('input', async (e) => {
        const query = e.target.value.trim();
        const btnRegresar = document.getElementById('btn-regresar');
        if (query === '') { if (btnRegresar) btnRegresar.style.display = 'none'; cargarProductos(); return; }
        btnRegresar.style.display = 'inline-block';
        const res = await fetch(`/buscar?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        renderizarProductos(data);
    });

    window.addEventListener("scroll", () => {
        const navbar = document.querySelector('.navbar-superior');
        if (window.scrollY > 100) navbar.classList.add('ocultar');
        else navbar.classList.remove('ocultar');
    });
});

async function cargarProductos() {
    const res = await fetch('/productos');
    const data = await res.json();
    renderizarProductos(data);
}

function renderizarProductos(data) {
    const cont = document.getElementById('resultados');
    cont.innerHTML = "";
    data.forEach(p => {
        const div = document.createElement('div');
        div.className = "producto";
        let url = p.imagen || "";
        if (url && !url.startsWith('http')) { url = '/' + (url.startsWith('images/') ? url : 'images/' + url); }
        const esVideo = url.match(/\.(mp4|webm|ogg|mov)$/i);
        const descripcionHTML = p.descripcion ? `<p>${p.descripcion}</p>` : "";

        div.innerHTML = `
            <div class="contenedor-media">
                ${esVideo ? `<video src="${url}" autoplay loop muted playsinline controls controlsList="nodownload"></video>`
                : `<img src="${url}" alt="${p.nombre}" onclick="abrirLightbox('${url}')" style="cursor:pointer;">`}
            </div>
            <div class="producto-info">
                <h2>${p.nombre || "Sin nombre"}</h2>
                ${descripcionHTML}
            </div>
        `;
        cont.appendChild(div);
    });
}

async function cargarCategorias() {
    const res = await fetch('/categorias');
    const cat = await res.json();
    const nav = document.getElementById('categorias-nav');
    cat.forEach(c => {
        const btn = document.createElement('button');
        btn.className = "btn-nav";
        btn.textContent = c.nombre;
        btn.onclick = async () => {
            document.getElementById('btn-regresar').style.display = 'inline-block';
            const res = await fetch(`/buscar?q=${encodeURIComponent(c.nombre)}`);
            const data = await res.json();
            renderizarProductos(data);
        };
        nav.appendChild(btn);
    });
}

function abrirLightbox(src) { document.getElementById('lightbox').style.display = 'flex'; document.getElementById('img-grande').src = src; }
function cerrarLightbox() { document.getElementById('lightbox').style.display = 'none'; }
function regresarPrincipal() { document.getElementById('buscar').value = ''; document.getElementById('btn-regresar').style.display = 'none'; cargarProductos(); }