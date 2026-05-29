let productoEditando = null;

// --- FUNCIÓN DEL MODAL ---
function mostrarConfirmacion(mensaje, callbackSi) {
    const modal = document.getElementById('modalConfirmacion');
    document.getElementById('modalConfMensaje').innerText = mensaje;
    modal.style.display = 'block';

    document.getElementById('btnConfSi').onclick = () => {
        modal.style.display = 'none';
        callbackSi();
    };
    document.getElementById('btnConfNo').onclick = () => {
        modal.style.display = 'none';
    };
}

// --- CONFIGURACIÓN DE SEGURIDAD ---
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': localStorage.getItem('adminToken') || ''
});

// --- FUNCIONES CORREGIDAS ---

async function eliminar(id) {
    mostrarConfirmacion('¿Estás seguro de que deseas eliminar este producto?', async () => {
        await fetch(`/productos/${id}`, { method: 'DELETE', headers: getHeaders() });
        cargarProductos();
    });
}

async function guardarEdicionInline(id, nombreAnterior) {
    const nuevoNombre = document.getElementById(`input-inline-${id}`).value.trim();
    if (!nuevoNombre || nuevoNombre === nombreAnterior) {
        await renderizarListaCategoriasAdmin();
        return;
    }

    mostrarConfirmacion(`¿Estás seguro de que deseas cambiar el nombre de "${nombreAnterior}" a "${nuevoNombre}"?`, async () => {
        await fetch(`/categorias/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ nombre: nuevoNombre })
        });
        await renderizarListaCategoriasAdmin();
        await cargarCategoriasNav();
        await cargarProductos();
    });
}

async function eliminarCategoria(id) {
    mostrarConfirmacion("¿Estás seguro de que deseas eliminar esta categoría?", async () => {
        await fetch(`/categorias/${id}`, { method: 'DELETE', headers: getHeaders() });
        await renderizarListaCategoriasAdmin();
        await cargarCategoriasNav();
    });
}

// --- RESTO DE TU LÓGICA ---

function mostrarPreviewMedia(path) {
    const contenedor = document.getElementById('contenedorPreview');
    const img = document.getElementById('imgPreview');
    const video = document.getElementById('videoPreview');
    if (!contenedor || !img || !video) return;
    if (!path) {
        contenedor.style.display = 'none';
        img.style.display = 'none';
        video.style.display = 'none';
        img.src = ''; video.src = '';
        return;
    }
    const formats = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.wmv', '.flv', '.3gp'];
    const esVideo = formats.some(ext => path.toLowerCase().endsWith(ext));
    const urlCompleta = path.startsWith('data:') ? path : `/${path}`;
    contenedor.style.display = 'block';
    if (esVideo) {
        img.style.display = 'none'; img.src = '';
        video.src = urlCompleta; video.style.display = 'inline-block';
    } else {
        video.style.display = 'none'; video.src = '';
        img.src = urlCompleta; img.style.display = 'inline-block';
    }
}

async function abrirModalAgregar() {
    productoEditando = null;
    document.getElementById('modalTitulo').innerText = "Nuevo Producto";
    document.getElementById('formMueble').reset();
    document.getElementById('contenedorOtro').style.display = 'none';
    mostrarPreviewMedia(null);
    await cargarCategoriasEnSelect();
    document.getElementById('modalMueble').style.display = "block";
    toggleMenu();
}

async function abrirModalEditar(id) {
    const res = await fetch(`/productos/${id}`);
    const prod = await res.json();
    productoEditando = prod;
    document.getElementById('modalTitulo').innerText = "Editar Producto";
    document.getElementById('contenedorOtro').style.display = 'none';
    await cargarCategoriasEnSelect();
    document.getElementById('nombre').value = prod.nombre;
    document.getElementById('categoriaSelect').value = prod.categoria;
    document.getElementById('descripcion').value = prod.descripcion;
    mostrarPreviewMedia(prod.imagen || null);
    document.getElementById('modalMueble').style.display = "block";
}

async function cargarCategoriasEnSelect() {
    const res = await fetch('/categorias');
    const categorias = await res.json();
    const select = document.getElementById('categoriaSelect');
    select.innerHTML = '<option value="" disabled selected>Selecciona una categoría</option>';
    categorias.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.nombre; opt.textContent = cat.nombre;
        select.appendChild(opt);
    });
    const optOtro = document.createElement('option');
    optOtro.value = "OTRO_NUEVO"; optOtro.textContent = "Otro...";
    select.appendChild(optOtro);
}

document.getElementById('categoriaSelect').addEventListener('change', (e) => {
    const contenedorOtro = document.getElementById('contenedorOtro');
    const inputOtro = document.getElementById('nuevaCategoriaInput');
    if (e.target.value === "OTRO_NUEVO") {
        contenedorOtro.style.display = 'block'; inputOtro.required = true; inputOtro.focus();
    } else {
        contenedorOtro.style.display = 'none'; inputOtro.required = false; inputOtro.value = '';
    }
});

function cerrarModalMueble() { document.getElementById('modalMueble').style.display = "none"; }
function cerrarModalCategorias() { document.getElementById('modalCategorias').style.display = "none"; }
function toggleMenu() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    sidebar.style.width = sidebar.style.width === "280px" ? "0" : "280px";
}

async function cargarProductos() {
    document.getElementById('buscar').value = '';
    document.getElementById('btn-regresar').style.display = 'none';
    const res = await fetch('/productos');
    const data = await res.json();
    renderizarProductos(data);
}

function renderizarProductos(productos) {
    const lista = document.getElementById('listaCategorias');
    lista.innerHTML = '';
    const categoriasUnicas = [...new Set(productos.map(p => p.categoria))];
    categoriasUnicas.forEach(cat => {
        const divCat = document.createElement('div');
        divCat.innerHTML = `<h2 style="margin:40px 0 20px; font-weight: 700; font-size: 1.6rem; color:#0f172a; text-transform: capitalize;">${cat}</h2><div class="grid"></div>`;
        lista.appendChild(divCat);
        const grid = divCat.querySelector('.grid');
        productos.filter(p => p.categoria === cat).forEach(prod => { grid.appendChild(crearTarjetaProducto(prod)); });
    });
}

function renderizarProductosPlano(productos, tituloPlano) {
    const lista = document.getElementById('listaCategorias');
    lista.innerHTML = `<h2 style="margin:40px 0 20px; font-weight: 700; font-size: 1.6rem; color:#0f172a;">${tituloPlano}</h2><div class="grid"></div>`;
    const grid = lista.querySelector('.grid');
    productos.forEach(prod => { grid.appendChild(crearTarjetaProducto(prod)); });
}

function crearTarjetaProducto(prod) {
    const card = document.createElement('div');
    card.className = 'producto';
    const formats = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.wmv', '.flv', '.3gp'];
    const esVideo = formats.some(ext => prod.imagen?.toLowerCase().endsWith(ext));
    const extension = prod.imagen?.split('.').pop().toLowerCase();
    card.innerHTML = `
        <div class="contenedor-media">
            ${esVideo ? `<video autoplay loop muted playsinline controls><source src="/${prod.imagen}" type="video/${extension === 'mov' ? 'mp4' : extension}"></video>` : `<img src="/${prod.imagen}">`}
        </div>
        <h3 style="font-size:1.1rem; margin: 10px 0 5px 0; font-weight:700; color:#0f172a;">${prod.nombre}</h3>
        <p style="font-size:0.85rem; color:#64748b; margin-bottom:15px; font-weight:400; line-height:1.4;">${prod.descripcion || 'Sin descripción'}</p>
        <div class="acciones-prod">
            <button class="btn-editar" onclick="abrirModalEditar(${prod.id_producto})">Editar</button>
            <button class="btn-borrar" onclick="eliminar(${prod.id_producto})">Borrar</button>
        </div>
    `;
    return card;
}

async function cargarCategoriasNav() {
    const res = await fetch('/categorias');
    const categories = await res.json();
    const nav = document.getElementById('categorias-nav');
    if (!nav) return;
    nav.innerHTML = '';
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'btn-nav';
        btn.textContent = cat.nombre;
        btn.onclick = () => { document.getElementById('btn-regresar').style.display = 'inline-block'; filtrar(cat.nombre); };
        nav.appendChild(btn);
    });
}

async function filtrar(nombre) {
    const res = await fetch(`/buscar?q=${encodeURIComponent(nombre)}`);
    const data = await res.json();
    const filtrados = data.filter(p => p.categoria.toLowerCase() === nombre.toLowerCase());
    renderizarProductosPlano(filtrados, nombre);
}

document.getElementById('formMueble').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    const originalText = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = 'Procesando...';

    try {
        const inputArchivo = document.getElementById('inputImagen');
        let pathImagen = productoEditando ? productoEditando.imagen : '';
        let categorySeleccionada = document.getElementById('categoriaSelect').value;
        if (categorySeleccionada === "OTRO_NUEVO") {
            const nuevaCatNombre = document.getElementById('nuevaCategoriaInput').value.trim();
            if (nuevaCatNombre) {
                await fetch('/categorias', { method: 'POST', headers: getHeaders(), body: JSON.stringify({ nombre: nuevaCatNombre }) });
                categorySeleccionada = nuevaCatNombre;
                await cargarCategoriasNav();
            }
        }
        if (inputArchivo.files.length > 0) {
            const formData = new FormData(); formData.append('imagen', inputArchivo.files[0]);
            const resUp = await fetch('/upload', { method: 'POST', headers: { 'Authorization': localStorage.getItem('adminToken') || '' }, body: formData });
            const dataUp = await resUp.json();
            pathImagen = dataUp.path;
        }
        const datos = { nombre: document.getElementById('nombre').value, categoria: categorySeleccionada, descripcion: document.getElementById('descripcion').value, imagen: pathImagen };
        const url = productoEditando ? `/productos/${productoEditando.id_producto}` : '/productos';
        await fetch(url, { method: productoEditando ? 'PUT' : 'POST', headers: getHeaders(), body: JSON.stringify(datos) });
        cerrarModalMueble();
        await cargarProductos();
    } catch (err) {
        alert("Error al procesar la solicitud.");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalText;
    }
});

async function toggleGestionCategorias() {
    toggleMenu();
    document.getElementById('modalCategorias').style.display = "block";
    await renderizarListaCategoriasAdmin();
}

async function renderizarListaCategoriasAdmin() {
    const res = await fetch('/categorias');
    const categorias = await res.json();
    const contenedor = document.getElementById('listaCategoriasAdmin');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    categorias.forEach(cat => {
        const div = document.createElement('div');
        div.style = "display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding:12px 16px; border-radius:10px; background:#f8fafc; border:1px solid #e2e8f0;";
        div.id = `fila-categoria-${cat.id_categoria}`;
        div.innerHTML = `<span class="cat-texto">${cat.nombre}</span><div class="cat-acciones"><button class="btn-editar" onclick="activarEdicionInline(${cat.id_categoria}, '${cat.nombre}')">Editar</button> <button class="btn-borrar" onclick="eliminarCategoria(${cat.id_categoria})">Borrar</button></div>`;
        contenedor.appendChild(div);
    });
}

function activarEdicionInline(id, nombreActual) {
    const fila = document.getElementById(`fila-categoria-${id}`);
    if (!fila) return;
    fila.innerHTML = `<input type="text" id="input-inline-${id}" value="${nombreActual}"><button class="btn-guardar" onclick="guardarEdicionInline(${id}, '${nombreActual}')">Guardar</button><button class="btn-borrar" onclick="renderizarListaCategoriasAdmin()">Cancelar</button>`;
}

document.getElementById('formCategorias').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nuevaCategoria').value.trim();
    if (!nombre) return;
    await fetch('/categorias', { method: 'POST', headers: getHeaders(), body: JSON.stringify({ nombre }) });
    document.getElementById('nuevaCategoria').value = '';
    await renderizarListaCategoriasAdmin();
    await cargarCategoriasNav();
});

function cerrarSesion() { localStorage.removeItem('adminToken'); window.location.href = 'login.html'; }

document.addEventListener('DOMContentLoaded', () => {
    cargarCategoriasNav();
    cargarProductos();
});