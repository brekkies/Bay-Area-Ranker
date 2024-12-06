document.addEventListener('DOMContentLoaded', () => {
    const downtowns = [
        'San Francisco',
        'San Jose',
        'Oakland',
        'Berkeley',
        'Palo Alto',
        'Mountain View'
    ];

    const list = document.getElementById('downtown-list');

    // Populate the list
    downtowns.forEach(downtown => {
        const li = document.createElement('li');
        li.textContent = downtown;
        li.draggable = true;
        list.appendChild(li);
    });

    // Drag-and-drop functionality
    let draggedItem = null;

    list.addEventListener('dragstart', (e) => {
        draggedItem = e.target;
        e.target.classList.add('dragging');
    });

    list.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
        draggedItem = null;
    });

    list.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(list, e.clientY);
        if (afterElement == null) {
            list.appendChild(draggedItem);
        } else {
            list.insertBefore(draggedItem, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
});
