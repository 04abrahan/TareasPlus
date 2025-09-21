document.addEventListener('DOMContentLoaded', function () {
    const tareaInput = document.getElementById('tarea-input');
    const agregarBtn = document.getElementById('agregar-btn');
    const listaTareas = document.getElementById('lista-tareas');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const totalTareasSpan = document.getElementById('total-tareas');
    const completadasTareasSpan = document.getElementById('completadas-tareas');

    let tareas = JSON.parse(localStorage.getItem('tareas')) || [];
    let filtroActual = 'todas';

    // Cargar tareas al iniciar
    renderTareas();
    actualizarContadores();

    // Agregar nueva tarea
    agregarBtn.addEventListener('click', agregarTarea);
    tareaInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            agregarTarea();
        }
    });

    // Filtros
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filtroActual = this.getAttribute('data-filter');
            renderTareas();
        });
    });

    function agregarTarea() {
        const texto = tareaInput.value.trim();
        if (texto === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Campo vacío',
                text: 'Por favor, escribe una tarea antes de agregar',
                confirmButtonColor: '#4facfe'
            });
            return;
        }

        const nuevaTarea = {
            id: Date.now(),
            texto: texto,
            completada: false,
            fecha: new Date().toLocaleDateString('es-ES')
        };

        tareas.unshift(nuevaTarea);
        guardarTareas();
        renderTareas();
        actualizarContadores();

        // Alerta de éxito
        Swal.fire({
            icon: 'success',
            title: '¡Tarea agregada!',
            text: 'Tu tarea se ha agregado correctamente',
            showConfirmButton: false,
            timer: 1500
        });

        tareaInput.value = '';
        tareaInput.focus();
    }

    function toggleCompletada(id) {
        tareas = tareas.map(tarea => {
            if (tarea.id === id) {
                const nuevaEstado = !tarea.completada;

                // Mostrar alerta de estado cambiado
                if (nuevaEstado) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Tarea completada!',
                        text: '¡Buen trabajo!',
                        showConfirmButton: false,
                        timer: 1500
                    });
                }

                return { ...tarea, completada: nuevaEstado };
            }
            return tarea;
        });

        guardarTareas();
        renderTareas();
        actualizarContadores();
    }

    function eliminarTarea(id) {
        // Alerta de confirmación personalizada
        Swal.fire({
            title: '¿Eliminar tarea?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4facfe',
            cancelButtonColor: '#ff4757',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                tareas = tareas.filter(tarea => tarea.id !== id);
                guardarTareas();
                renderTareas();
                actualizarContadores();

                // Alerta de éxito al eliminar
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminada!',
                    text: 'Tu tarea ha sido eliminada.',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        });
    }

    function renderTareas() {
        let tareasFiltradas = tareas;

        if (filtroActual === 'pendientes') {
            tareasFiltradas = tareas.filter(t => !t.completada);
        } else if (filtroActual === 'completadas') {
            tareasFiltradas = tareas.filter(t => t.completada);
        }

        if (tareasFiltradas.length === 0) {
            listaTareas.innerHTML = '<li class="vacio">No hay tareas. ¡Agrega alguna!</li>';
            return;
        }

        listaTareas.innerHTML = '';

        tareasFiltradas.forEach(tarea => {
            const li = document.createElement('li');
            if (tarea.completada) {
                li.classList.add('completada');
            }

            li.innerHTML = `
                        <input type="checkbox" class="tarea-checkbox" ${tarea.completada ? 'checked' : ''}>
                        <span class="tarea-texto">${tarea.texto}</span>
                        <small style="margin-left: auto; margin-right: 10px; color: #888; font-size: 12px;">${tarea.fecha}</small>
                        <button class="tarea-eliminar"><i class="fas fa-trash"></i></button>
                    `;

            li.querySelector('.tarea-checkbox').addEventListener('change', () => toggleCompletada(tarea.id));
            li.querySelector('.tarea-eliminar').addEventListener('click', () => eliminarTarea(tarea.id));

            listaTareas.appendChild(li);
        });
    }

    function actualizarContadores() {
        const total = tareas.length;
        const completadas = tareas.filter(t => t.completada).length;

        totalTareasSpan.textContent = `Total: ${total} tarea${total !== 1 ? 's' : ''}`;
        completadasTareasSpan.textContent = `Completadas: ${completadas}`;
    }

    function guardarTareas() {
        localStorage.setItem('tareas', JSON.stringify(tareas));
    }
});
