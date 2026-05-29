document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("Formulario enviado, iniciando fetch...");

        const usuario = document.getElementById('usuario').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, password })
            });

            console.log("Respuesta recibida, estatus:", response.status);
            const data = await response.json();
            console.log("Datos recibidos:", data);

            if (data.ok) {
                console.log("Redirigiendo a admin.html...");
                window.location.href = '/admin.html';
            } else {
                alert('Error del servidor: ' + (data.mensaje || 'Credenciales incorrectas'));
            }
        } catch (error) {
            console.error("Error crítico de red:", error);
            alert('No se pudo conectar al servidor. Revisa la consola (F12).');
        }
    });
});
