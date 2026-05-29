document.getElementById('loginForm').addEventListener('submit', function (e) {
    // 1. Detenemos el envío del formulario a toda costa
    e.preventDefault();
    e.stopImmediatePropagation();

    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;

    console.log("Enviando:", usuario, password);

    // 2. Usamos fetch con una ruta absoluta para asegurar que llegue al servidor
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password })
    })
        .then(response => response.json())
        .then(data => {
            console.log("Respuesta del servidor:", data);
            if (data.ok) {
                // 3. Forzamos la redirección
                window.location.href = '/admin.html';
            } else {
                alert("Usuario o contraseña incorrectos");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Error de conexión");
        });

    return false; // Seguridad extra contra recarga
});