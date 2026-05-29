document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;

    try {
        // RUTA RELATIVA: Sin localhost
        const resp = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });

        const resultado = await resp.json();

        if (resultado.ok) {
            window.location.href = "admin.html";
        } else {
            alert(resultado.mensaje || "Usuario o contraseña incorrectos");
        }
    } catch (error) {
        console.error(error);
        alert("No se pudo conectar con el servidor.");
    }
});

// Mantén aquí también la función de ver/ocultar contraseña que tenías en el HTML
function toggleVisibilidadLogin() {
    const inputPass = document.getElementById('password');
    const iconoPass = document.getElementById('toggleLoginPassword');
    if (inputPass.type === "password") {
        inputPass.type = "text";
        iconoPass.className = "fa-solid fa-eye";
        iconoPass.style.color = "#eab308";
    } else {
        inputPass.type = "password";
        iconoPass.className = "fa-solid fa-eye-slash";
        iconoPass.style.color = "#a0aec0";
    }
}