export class DragManager {
    constructor() {
        this.board = document.getElementById('board');
        this.setupBackgroundSetting();
        this.setupWidgetDragging();
        this.setupWidgetControls();
    }

    setupBackgroundSetting() {
        const backgroundInput = document.getElementById('board-background-url');
        const setBackgroundBtn = document.getElementById('set-background-btn');

        setBackgroundBtn.addEventListener('click', () => {
            const imageUrl = backgroundInput.value.trim();
            if (imageUrl) {
                this.board.style.backgroundImage = `url('${imageUrl}')`;
                this.board.style.backgroundSize = 'cover';
                this.board.style.backgroundPosition = 'center';
                this.board.style.backgroundRepeat = 'no-repeat';
            }
        });
    }

    setupWidgetDragging() {
        this.board.addEventListener('mousedown', (e) => {
            const widget = e.target.closest('.draggable');
            if (!widget || e.target.closest('.widget-header')) return;

            let startX = e.clientX - widget.offsetLeft;
            let startY = e.clientY - widget.offsetTop;

            const moveWidget = (e) => {
                widget.style.position = 'absolute';
                widget.style.left = `${e.clientX - startX}px`;
                widget.style.top = `${e.clientY - startY}px`;
            };

            const stopMoving = () => {
                document.removeEventListener('mousemove', moveWidget);
                document.removeEventListener('mouseup', stopMoving);
            };

            document.addEventListener('mousemove', moveWidget);
            document.addEventListener('mouseup', stopMoving);
        });
    }

    setupWidgetControls() {
        this.board.addEventListener('click', (e) => {
            const widget = e.target.closest('.draggable');
            if (!widget) return;

            // Settings button
            if (e.target.classList.contains('widget-settings-btn')) {
                const settingsPanel = widget.querySelector('.widget-settings');
                settingsPanel.classList.toggle('hidden');
            }

            // Close button
            if (e.target.classList.contains('widget-close-btn')) {
                widget.remove();
            }
        });
    }
}

// Initialize drag manager when the script loads
new DragManager();
