const startHour = 16;
const endHour = 24;


function generarTabla(tbodyId) {
    const tbody = document.getElementById(tbodyId);

    for (let h = startHour; h < endHour; h++) {
        const row = document.createElement("tr");

        // Cancha 1
        const cancha1 = document.createElement("td");
        cancha1.setAttribute("data-label", "Cancha 1");
        const input1 = document.createElement("input");
        input1.type = "text";
        input1.placeholder = "Nombre...";
        cancha1.appendChild(input1);
        row.appendChild(cancha1);

        // Hora
        const hora = document.createElement("td");
        hora.setAttribute("data-label", "Hora");
        hora.textContent = `${h}:00 - ${h + 1}:00`;
        row.appendChild(hora);

        // Cancha 2
        const cancha2 = document.createElement("td");
        cancha2.setAttribute("data-label", "Cancha 2");
        const input2 = document.createElement("input");
        input2.type = "text";
        input2.placeholder = "Nombre...";
        cancha2.appendChild(input2);
        row.appendChild(cancha2);

        tbody.appendChild(row);
    }
}


// Celdas editables
function convertirEnInput(cell) {
    if (cell.querySelector("input")) return;
    const valorAnterior = cell.textContent;
    cell.textContent = "";
    const input = document.createElement("input");
    input.type = "text";
    input.value = valorAnterior;
    input.placeholder = "Nombre...";
    cell.appendChild(input);
    input.focus();

    input.addEventListener("blur", () => {
        cell.textContent = input.value;
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") input.blur();
    });
}

// Fecha automática
function ponerFechaHoy() {
    const hoy = new Date();
    const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const fechaFormateada = hoy.toLocaleDateString('es-ES', opciones);

    document.getElementById("titulo-padel").textContent = "Cancha de Pádel - Fecha: " + fechaFormateada;
    document.getElementById("titulo-futbol").textContent = "Cancha de Fútbol 5 - Fecha: " + fechaFormateada;
}

// Ejecutar
generarTabla("tabla-padel");
generarTabla("tabla-futbol");
ponerFechaHoy();