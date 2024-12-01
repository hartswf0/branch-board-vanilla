import { DragManager } from './drag-manager.js';

class BranchBoard {
    constructor() {
        this.board = document.getElementById('board');
        this.widgetSelector = document.getElementById('widget-selector');
        
        this.initializeEventListeners();
        this.dragManager = new DragManager();
        this.initializePaintOverlay();
    }

    initializeEventListeners() {
        this.widgetSelector.addEventListener('change', this.addWidget.bind(this));
    }

    addWidget() {
        const widgetType = this.widgetSelector.value;
        if (!widgetType) return;

        // Special case for paint overlay
        if (widgetType === 'leaf-paint') {
            console.log('Attempting to open paint overlay');
            const paintOverlay = document.getElementById('paint-overlay');
            if (!paintOverlay) {
                console.error('Paint overlay element not found');
                return;
            }
            
            console.log('Paint overlay element found:', paintOverlay);
            paintOverlay.classList.add('active');
            console.log('Active class added to paint overlay');
            
            this.widgetSelector.value = '';
            return;
        }

        const templateId = `${widgetType}-template`;
        const template = document.getElementById(templateId);
        
        if (!template) {
            console.error(`No template found for widget type: ${widgetType}`);
            return;
        }

        // Clone the template content
        const widgetClone = template.content.cloneNode(true);
        const widget = widgetClone.querySelector('.widget');
        
        // Ensure widget has a unique ID
        widget.id = `widget-${widgetType}-${Date.now()}`;
        
        // Initialize widget based on type
        try {
            switch(widgetType) {
                case 'tree-ring-timer':
                    this.initializeTreeRingTimer(widget);
                    break;
                case 'sundial-clock':
                    this.initializeSundialClock(widget);
                    break;
                case 'rockslide-meter':
                    this.initializeRockslideMeter(widget);
                    break;
                case 'branchout-picker':
                    this.initializeBranchoutPicker(widget);
                    break;
                case 'pinecone-dice':
                    this.initializePineconeDice(widget);
                    break;
                case 'leaf-qr':
                    this.initializeLeafQR(widget);
                    break;
                case 'bark-text':
                    this.initializeBarkText(widget);
                    break;
                case 'leaf-poll':
                    this.initializeLeafPoll(widget);
                    break;
                case 'nest-embed':
                    this.initializeNestEmbed(widget);
                    break;
                default:
                    console.warn(`No initialization method for widget type: ${widgetType}`);
            }
            
            // Make widget draggable
            this.makeDraggable(widget);
            
            // Append to board
            this.board.appendChild(widget);
            
            // Reset widget selector
            this.widgetSelector.value = '';
        } catch (error) {
            console.error(`Error initializing ${widgetType} widget:`, error);
        }
    }

    initializeTreeRingTimer(widget) {
        const timerDisplay = widget.querySelector('.timer-display');
        const startBtn = widget.querySelector('.start-btn');
        const resetBtn = widget.querySelector('.reset-btn');
        const durationInput = widget.querySelector('.timer-duration');
        const ringContainer = widget.querySelector('.ring-container');

        let interval;
        let timeLeft;
        let totalTime;

        function createRing() {
            const ring = document.createElement('div');
            ring.classList.add('timer-ring');
            ringContainer.appendChild(ring);
            return ring;
        }

        function updateDisplay() {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            // Update ring growth
            const progress = 1 - (timeLeft / totalTime);
            const rings = ringContainer.querySelectorAll('.timer-ring');
            rings.forEach((ring, index) => {
                ring.style.transform = `scale(${progress * (index + 1)})`;
                ring.style.opacity = `${1 - progress}`;
            });
        }

        startBtn.addEventListener('click', () => {
            // Validate input
            const duration = parseInt(durationInput.value);
            if (isNaN(duration) || duration <= 0) {
                alert('Please enter a valid timer duration');
                return;
            }

            if (interval) {
                clearInterval(interval);
                interval = null;
                startBtn.textContent = 'Start';
                return;
            }

            // Clear previous rings
            ringContainer.innerHTML = '';

            // Create 3 rings
            for (let i = 0; i < 3; i++) {
                createRing();
            }

            // Set timer
            timeLeft = duration * 60;
            totalTime = timeLeft;

            interval = setInterval(() => {
                if (timeLeft <= 0) {
                    clearInterval(interval);
                    timerDisplay.textContent = '00:00';
                    startBtn.textContent = 'Start';
                    ringContainer.innerHTML = ''; // Clear rings
                    return;
                }
                
                timeLeft--;
                updateDisplay();
            }, 1000);

            startBtn.textContent = 'Pause';
        });

        resetBtn.addEventListener('click', () => {
            clearInterval(interval);
            interval = null;
            ringContainer.innerHTML = ''; // Clear rings
            timerDisplay.textContent = '00:00';
            startBtn.textContent = 'Start';
        });

        // Initial setup
        timerDisplay.textContent = '00:00';
    }

    initializeLeafQR(widget) {
        const qrInput = widget.querySelector('.qr-input');
        const generateBtn = widget.querySelector('.generate-qr-btn');
        const qrPreview = widget.querySelector('.qr-preview');
        const sizeInput = widget.querySelector('.qr-size');
        const colorInput = widget.querySelector('.qr-color');

        generateBtn.addEventListener('click', () => {
            const text = qrInput.value.trim();
            if (!text) return;

            qrPreview.innerHTML = ''; // Clear previous QR
            
            // Use qrcode-generator library
            const qr = qrcode(0, 'M');
            qr.addData(text);
            qr.make();

            // Reduce size and create img
            const imgTag = qr.createImgTag(3); // Smaller size
            qrPreview.innerHTML = imgTag;

            // Apply custom color and sizing
            const imgElement = qrPreview.querySelector('img');
            if (imgElement) {
                imgElement.style.maxWidth = '150px'; // Limit max width
                imgElement.style.maxHeight = '150px'; // Limit max height
                imgElement.style.filter = `drop-shadow(0 0 5px ${colorInput.value})`;
            }
        });
    }

    initializeSundialClock(widget) {
        const hourHand = widget.querySelector('.hour-hand');
        const minuteHand = widget.querySelector('.minute-hand');
        const secondHand = widget.querySelector('.second-hand');
        const digitalDisplay = widget.querySelector('.digital-display');
        const formatToggle = widget.querySelector('.format-toggle');

        let is24HourFormat = false;

        function updateClock() {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();

            // Rotate hands
            const secondDegrees = (seconds / 60) * 360;
            const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
            const hourDegrees = ((hours % 12 + minutes / 60) / 12) * 360;

            secondHand.style.transform = `rotate(${secondDegrees}deg)`;
            minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
            hourHand.style.transform = `rotate(${hourDegrees}deg)`;

            // Update digital display
            let displayHours = hours;
            const ampm = hours >= 12 ? 'PM' : 'AM';

            if (!is24HourFormat) {
                displayHours = hours % 12;
                displayHours = displayHours ? displayHours : 12;
                digitalDisplay.textContent = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
            } else {
                digitalDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }
        }

        // Toggle time format
        formatToggle.addEventListener('click', () => {
            is24HourFormat = !is24HourFormat;
            updateClock();
        });

        // Generate hour markers
        const hourMarkersContainer = widget.querySelector('.hour-markers');
        for (let i = 1; i <= 12; i++) {
            const marker = document.createElement('div');
            marker.classList.add('hour-marker');
            marker.style.transform = `rotate(${(i * 30) - 90}deg)`;
            marker.style.transformOrigin = '50% 100px';
            hourMarkersContainer.appendChild(marker);
        }

        // Initial update and start interval
        updateClock();
        const clockInterval = setInterval(updateClock, 1000);

        // Cleanup when widget is removed
        const closeBtn = widget.querySelector('.widget-close-btn');
        closeBtn.addEventListener('click', () => {
            clearInterval(clockInterval);
        });
    }

    initializeRockslideMeter(widget) {
        const soundLevelBar = widget.querySelector('.sound-level-bar');
        const soundLevelIndicator = widget.querySelector('.sound-level-indicator');
        const rockslideWarning = widget.querySelector('.rockslide-warning');
        const thresholdInput = widget.querySelector('#decibel-threshold');
        const thresholdValue = widget.querySelector('.threshold-value');
        const startBtn = widget.querySelector('.start-monitoring-btn');
        const stopBtn = widget.querySelector('.stop-monitoring-btn');

        let audioContext = null;
        let analyser = null;
        let microphone = null;
        let isMonitoring = false;

        // Update threshold display
        thresholdInput.addEventListener('input', () => {
            thresholdValue.textContent = `${thresholdInput.value} dB`;
        });

        // Start sound monitoring
        async function startMonitoring() {
            if (isMonitoring) return;

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                microphone = audioContext.createMediaStreamSource(stream);
                analyser = audioContext.createAnalyser();
                
                microphone.connect(analyser);
                analyser.fftSize = 256;

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                isMonitoring = true;
                startBtn.disabled = true;
                stopBtn.disabled = false;

                function updateSoundLevel() {
                    if (!isMonitoring) return;

                    analyser.getByteFrequencyData(dataArray);
                    const averageVolume = dataArray.reduce((a, b) => a + b) / bufferLength;
                    const decibelLevel = Math.round(20 * Math.log10(averageVolume));

                    // Update sound level bar and indicator
                    const percentage = Math.min((decibelLevel / 120) * 100, 100);
                    soundLevelBar.style.width = `${percentage}%`;
                    soundLevelIndicator.textContent = `${decibelLevel} dB`;

                    // Check rockslide threshold
                    const threshold = parseInt(thresholdInput.value);
                    if (decibelLevel >= threshold) {
                        rockslideWarning.classList.add('active');
                    } else {
                        rockslideWarning.classList.remove('active');
                    }

                    requestAnimationFrame(updateSoundLevel);
                }

                updateSoundLevel();
            } catch (error) {
                console.error('Error accessing microphone:', error);
                alert('Unable to access microphone. Please check permissions.');
            }
        }

        // Stop sound monitoring
        function stopMonitoring() {
            if (!isMonitoring) return;

            isMonitoring = false;
            startBtn.disabled = false;
            stopBtn.disabled = true;

            if (microphone) {
                microphone.disconnect();
            }
            if (audioContext) {
                audioContext.close();
            }

            soundLevelBar.style.width = '0%';
            soundLevelIndicator.textContent = '0 dB';
            rockslideWarning.classList.remove('active');
        }

        // Event listeners
        startBtn.addEventListener('click', startMonitoring);
        stopBtn.addEventListener('click', stopMonitoring);

        // Initial state
        stopBtn.disabled = true;
    }

    initializeBranchoutPicker(widget) {
        const studentListTextarea = widget.querySelector('.student-list');
        const pickStudentBtn = widget.querySelector('.pick-student-btn');
        const selectedStudentDisplay = widget.querySelector('.selected-student');
        const pickerModeSelect = widget.querySelector('.picker-mode');

        let students = [];
        let usedStudents = [];

        studentListTextarea.addEventListener('input', () => {
            // Split students, trim whitespace, remove empty entries
            students = studentListTextarea.value.split('\n')
                .map(name => name.trim())
                .filter(name => name.length > 0);
        });

        pickStudentBtn.addEventListener('click', () => {
            if (students.length === 0) {
                alert('Please enter student names');
                return;
            }

            let selectedStudent;
            if (pickerModeSelect.value === 'sequential') {
                // Sequential mode
                if (usedStudents.length >= students.length) {
                    usedStudents = []; // Reset if all students have been picked
                }
                
                // Find a student not yet used
                selectedStudent = students.find(student => !usedStudents.includes(student));
            } else {
                // Random mode
                if (usedStudents.length >= students.length) {
                    usedStudents = []; // Reset if all students have been picked
                }

                // Filter out used students
                const availableStudents = students.filter(student => !usedStudents.includes(student));
                
                // Pick random student from available
                const randomIndex = Math.floor(Math.random() * availableStudents.length);
                selectedStudent = availableStudents[randomIndex];
            }

            // Mark student as used and display
            usedStudents.push(selectedStudent);
            selectedStudentDisplay.textContent = selectedStudent;
            selectedStudentDisplay.style.fontWeight = 'bold';
            selectedStudentDisplay.style.color = 'var(--leaf-500)';
        });
    }

    initializePineconeDice(widget) {
        const diceTypeSelect = widget.querySelector('.dice-type');
        const rollDiceBtn = widget.querySelector('.roll-dice-btn');
        const diceResultDisplay = widget.querySelector('.dice-result');
        const diceColorInput = widget.querySelector('.dice-color');

        rollDiceBtn.addEventListener('click', () => {
            const diceType = parseInt(diceTypeSelect.value);
            const result = Math.floor(Math.random() * diceType) + 1;

            // Animate dice roll
            diceResultDisplay.classList.add('rolling');
            setTimeout(() => {
                diceResultDisplay.classList.remove('rolling');
                diceResultDisplay.textContent = result;
                diceResultDisplay.style.color = diceColorInput.value;
            }, 500);
        });
    }

    initializeBarkText(widget) {
        const editorContent = widget.querySelector('.editor-content');
        const styleBtns = widget.querySelectorAll('.style-btn');
        const headingSelect = widget.querySelector('.heading-select');
        const colorPicker = widget.querySelector('.text-color-picker');
        const colorPickerBtn = widget.querySelector('.color-picker-btn');
        const listBtns = widget.querySelectorAll('.list-btn');
        const todoListContainer = widget.querySelector('.todo-list-container');
        const todoList = widget.querySelector('.todo-list');
        const todoInput = widget.querySelector('.todo-input');
        const addTodoBtn = widget.querySelector('.add-todo-btn');

        // Emoji Picker
        const emojiPickerBtn = widget.querySelector('.emoji-picker-btn');
        const emojiDropdown = widget.querySelector('.emoji-dropdown');
        const emojiCategories = widget.querySelector('.emoji-categories');
        const emojiGrid = widget.querySelector('.emoji-grid');

        // Emoji Data
        const emojis = {
            smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙'],
            animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐒', '🐔', '🐧', '🐦', '🐤'],
            nature: ['🌿', '🍀', '🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌷', '🌹', '🌺', '🌻', '🌼', '🌸', '🍄', '🌈', '☀️', '🌤️', '🌥️', '🌦️'],
            food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒']
        };

        // Toggle Emoji Dropdown
        emojiPickerBtn.addEventListener('click', () => {
            emojiDropdown.style.display = emojiDropdown.style.display === 'none' ? 'block' : 'none';
        });

        // Populate Emoji Categories
        Object.keys(emojis).forEach(category => {
            const categoryBtn = emojiCategories.querySelector(`[data-category="${category}"]`);
            categoryBtn.addEventListener('click', () => {
                // Clear previous emojis
                emojiGrid.innerHTML = '';
                
                // Populate grid with emojis from selected category
                emojis[category].forEach(emoji => {
                    const emojiBtn = document.createElement('button');
                    emojiBtn.textContent = emoji;
                    emojiBtn.addEventListener('click', () => {
                        // Insert emoji at cursor position
                        const selection = window.getSelection();
                        const range = selection.getRangeAt(0);
                        const emojiNode = document.createTextNode(emoji);
                        range.insertNode(emojiNode);
                        
                        // Move cursor after inserted emoji
                        range.setStartAfter(emojiNode);
                        range.setEndAfter(emojiNode);
                        selection.removeAllRanges();
                        selection.addRange(range);
                        
                        // Close dropdown
                        emojiDropdown.style.display = 'none';
                        editorContent.focus();
                    });
                    emojiGrid.appendChild(emojiBtn);
                });
            });
        });

        // Close emoji dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!emojiPickerBtn.contains(e.target) && !emojiDropdown.contains(e.target)) {
                emojiDropdown.style.display = 'none';
            }
        });

        // Color Picker Functionality
        colorPickerBtn.addEventListener('click', () => {
            colorPicker.click();
        });

        // Text Color
        colorPicker.addEventListener('input', () => {
            document.execCommand('foreColor', false, colorPicker.value);
            editorContent.focus();
        });

        // Text Styling
        styleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const style = btn.dataset.style;
                document.execCommand(style, false, null);
                editorContent.focus();
            });
        });

        // Heading Styles
        headingSelect.addEventListener('change', () => {
            const headingType = headingSelect.value;
            if (headingType) {
                document.execCommand('formatBlock', false, headingType);
            } else {
                document.execCommand('formatBlock', false, 'p');
            }
            editorContent.focus();
        });

        // List Functionality
        listBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const listType = btn.dataset.list;
                switch (listType) {
                    case 'ul':
                        document.execCommand('insertUnorderedList', false, null);
                        break;
                    case 'ol':
                        document.execCommand('insertOrderedList', false, null);
                        break;
                    case 'todo':
                        todoListContainer.style.display = 'block';
                        break;
                }
                editorContent.focus();
            });
        });

        // Todo List Functionality
        addTodoBtn.addEventListener('click', () => {
            const taskText = todoInput.value.trim();
            if (taskText) {
                const listItem = document.createElement('li');
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.addEventListener('change', () => {
                    listItem.classList.toggle('completed');
                });

                const taskSpan = document.createElement('span');
                taskSpan.textContent = taskText;

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '❌';
                deleteBtn.addEventListener('click', () => {
                    todoList.removeChild(listItem);
                });

                listItem.appendChild(checkbox);
                listItem.appendChild(taskSpan);
                listItem.appendChild(deleteBtn);

                todoList.appendChild(listItem);
                todoInput.value = '';
            }
        });

        // Allow Enter key to add todo
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTodoBtn.click();
            }
        });

        // Add Note to Board Button
        const addNoteToBoardBtn = document.createElement('button');
        addNoteToBoardBtn.textContent = '📌 Pin Note';
        addNoteToBoardBtn.classList.add('add-note-btn');
        widget.querySelector('.bark-text-container').appendChild(addNoteToBoardBtn);

        // Add Note to Board Functionality
        addNoteToBoardBtn.addEventListener('click', () => {
            // Create a new note widget
            const noteWidget = document.createElement('div');
            noteWidget.classList.add('widget', 'bark-note', 'draggable');
            
            // Create widget header
            const header = document.createElement('div');
            header.classList.add('widget-header');
            header.innerHTML = `
                <h3>Pinned Note</h3>
                <div class="widget-controls">
                    <button class="widget-close-btn">✖️</button>
                </div>
            `;
            
            // Create note content
            const noteContent = document.createElement('div');
            noteContent.classList.add('note-content');
            noteContent.innerHTML = editorContent.innerHTML;
            
            // Assemble the note widget
            noteWidget.appendChild(header);
            noteWidget.appendChild(noteContent);
            
            // Add close functionality
            const closeBtn = noteWidget.querySelector('.widget-close-btn');
            closeBtn.addEventListener('click', () => {
                this.board.removeChild(noteWidget);
            });

            // Make the note draggable
            this.makeDraggable(noteWidget);
            
            // Add to board
            this.board.appendChild(noteWidget);
            
            // Clear the original editor
            editorContent.innerHTML = '';
            todoList.innerHTML = '';
            todoListContainer.style.display = 'none';
        });
    }

    initializeLeafPoll(widget) {
        const questionInput = widget.querySelector('.poll-question');
        const optionsContainer = widget.querySelector('.poll-options');
        const addOptionBtn = widget.querySelector('.add-option-btn');
        const createPollBtn = widget.querySelector('.create-poll-btn');
        const closeBtn = widget.querySelector('.widget-close-btn');
        
        // Add option functionality
        addOptionBtn.addEventListener('click', () => {
            const newOptionInput = document.createElement('input');
            newOptionInput.type = 'text';
            newOptionInput.classList.add('poll-option');
            newOptionInput.placeholder = `Option ${optionsContainer.children.length + 1}`;
            optionsContainer.appendChild(newOptionInput);
        });
        
        // Create poll functionality
        createPollBtn.addEventListener('click', () => {
            const question = questionInput.value.trim();
            const options = Array.from(optionsContainer.querySelectorAll('.poll-option'))
                .map(input => input.value.trim())
                .filter(option => option !== '');
            
            if (!question || options.length < 2) {
                alert('Please enter a question and at least two options');
                return;
            }
            
            // Generate a simple QR code
            const pollId = `poll-${Date.now()}`;
            const pollUrl = `https://branchboard.com/poll/${pollId}`;
            
            // Create QR Code
            const qrContainer = document.createElement('div');
            qrContainer.classList.add('poll-qr-container');
            
            try {
                const qr = qrcode(0, 'M');
                qr.addData(pollUrl);
                qr.make();
                
                qrContainer.innerHTML = `
                    <div class="poll-qr-code">
                        ${qr.createImgTag(5)}
                        <p>Scan to participate</p>
                        <small>Poll ID: ${pollId}</small>
                    </div>
                `;
                
                // Replace options with QR code and results
                optionsContainer.innerHTML = '';
                optionsContainer.appendChild(qrContainer);
                
                // Copy poll details to clipboard
                navigator.clipboard.writeText(`
Poll Question: ${question}
Participation Link: ${pollUrl}
Poll ID: ${pollId}
                `).then(() => {
                    alert('Poll details copied to clipboard!');
                });
            } catch (error) {
                console.error('QR Code generation failed:', error);
                alert('Failed to generate QR code. Please try again.');
            }
        });
        
        // Close button
        closeBtn.addEventListener('click', () => {
            this.board.removeChild(widget);
        });
    }

    initializeNestEmbed(widget) {
        const youtubeUrlInput = widget.querySelector('.youtube-url');
        const embedVideoBtn = widget.querySelector('.embed-video-btn');
        const embedFrame = widget.querySelector('.embedded-video');
        const closeBtn = widget.querySelector('.widget-close-btn');
        
        // Embed video functionality
        embedVideoBtn.addEventListener('click', () => {
            const youtubeUrl = youtubeUrlInput.value.trim();
            if (!youtubeUrl) {
                alert('Please enter a YouTube URL');
                return;
            }
            
            // Comprehensive YouTube URL parsing
            const youtubePatterns = [
                /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
                /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
                /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/
            ];
            
            let videoId = null;
            for (const pattern of youtubePatterns) {
                const match = youtubeUrl.match(pattern);
                if (match && match[1]) {
                    videoId = match[1];
                    break;
                }
            }
            
            if (videoId) {
                // Construct clean embed URL
                const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&modestbranding=1&rel=0`;
                embedFrame.src = embedUrl;
                embedFrame.style.display = 'block';
                
                // Generate QR code for video link
                try {
                    const qrContainer = document.createElement('div');
                    qrContainer.classList.add('video-qr-container');
                    
                    const qr = qrcode(0, 'M');
                    qr.addData(youtubeUrl);
                    qr.make();
                    
                    qrContainer.innerHTML = `
                        <div class="video-qr-code">
                            ${qr.createImgTag(5)}
                            <small>Scan to view video</small>
                        </div>
                    `;
                    
                    // Add QR code next to iframe
                    widget.querySelector('.embed-container').appendChild(qrContainer);
                } catch (error) {
                    console.error('QR Code generation failed:', error);
                }
            } else {
                alert('Invalid YouTube URL. Please enter a valid YouTube video link.');
                embedFrame.style.display = 'none';
            }
        });
        
        // Close button
        closeBtn.addEventListener('click', () => {
            this.board.removeChild(widget);
        });
    }

    initializeLeafPaint(widget) {
        const canvas = widget.querySelector('.paint-canvas');
        const colorPicker = widget.querySelector('.color-picker');
        const brushSizeInput = widget.querySelector('.brush-size');
        const clearCanvasBtn = widget.querySelector('.clear-canvas-btn');
        const closeBtn = widget.querySelector('.widget-close-btn');
        const dragToggleBtn = widget.querySelector('.drag-toggle-btn');
        
        const ctx = canvas.getContext('2d');
        
        // Initial canvas setup
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = brushSizeInput.value;
        ctx.lineCap = 'round';
        
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;
        let isDraggable = false;
        
        // Drawing functions
        function startDrawing(e) {
            if (isDraggable) return;
            isDrawing = true;
            [lastX, lastY] = [e.offsetX, e.offsetY];
        }
        
        function draw(e) {
            if (isDraggable || !isDrawing) return;
            
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            
            [lastX, lastY] = [e.offsetX, e.offsetY];
        }
        
        // Event Listeners
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', () => isDrawing = false);
        canvas.addEventListener('mouseout', () => isDrawing = false);
        
        // Color Picker
        colorPicker.addEventListener('change', () => {
            ctx.strokeStyle = colorPicker.value;
        });
        
        // Brush Size
        brushSizeInput.addEventListener('input', () => {
            ctx.lineWidth = brushSizeInput.value;
        });
        
        // Clear Canvas
        clearCanvasBtn.addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
        
        // Drag Toggle
        dragToggleBtn.addEventListener('click', () => {
            isDraggable = !isDraggable;
            
            if (isDraggable) {
                // Enable dragging
                widget.setAttribute('draggable', 'true');
                dragToggleBtn.classList.add('draggable');
                dragToggleBtn.textContent = '🔓';
                
                // Disable drawing
                canvas.style.pointerEvents = 'none';
            } else {
                // Disable dragging
                widget.removeAttribute('draggable');
                dragToggleBtn.classList.remove('draggable');
                dragToggleBtn.textContent = '🔒';
                
                // Enable drawing
                canvas.style.pointerEvents = 'auto';
            }
        });
        
        // Close Button
        closeBtn.addEventListener('click', () => {
            this.board.removeChild(widget);
        });
    }

    initializePaintOverlay() {
        console.log('Initializing paint overlay');
        const paintOverlay = document.getElementById('paint-overlay');
        if (!paintOverlay) {
            console.error('Paint overlay element not found in DOM');
            return;
        }
        
        const canvas = document.getElementById('full-paint-canvas');
        if (!canvas) {
            console.error('Paint canvas element not found in DOM');
            return;
        }
        
        const colorPicker = document.getElementById('paint-color-picker');
        const brushSizeInput = document.getElementById('paint-brush-size');
        const clearBtn = document.getElementById('clear-paint-btn');
        const closeBtn = document.getElementById('close-paint-btn');
        
        // Set canvas to full window size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const ctx = canvas.getContext('2d');
        
        // Initial canvas setup
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = brushSizeInput.value;
        ctx.lineCap = 'round';
        
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;
        
        // Drawing functions
        function startDrawing(e) {
            isDrawing = true;
            [lastX, lastY] = [e.clientX, e.clientY];
        }
        
        function draw(e) {
            if (!isDrawing) return;
            
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(e.clientX, e.clientY);
            ctx.stroke();
            
            [lastX, lastY] = [e.clientX, e.clientY];
        }
        
        // Event Listeners
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', () => isDrawing = false);
        canvas.addEventListener('mouseout', () => isDrawing = false);
        
        // Color Picker
        colorPicker.addEventListener('change', () => {
            ctx.strokeStyle = colorPicker.value;
        });
        
        // Brush Size
        brushSizeInput.addEventListener('input', () => {
            ctx.lineWidth = brushSizeInput.value;
        });
        
        // Clear Canvas
        clearBtn.addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
        
        // Close Paint Overlay
        closeBtn.addEventListener('click', () => {
            console.log('Closing paint overlay');
            paintOverlay.classList.remove('active');
        });
        
        // Resize canvas when window is resized
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
        
        console.log('Paint overlay initialization complete');
    }

    makeDraggable(element) {
        // Make the element draggable
        element.setAttribute('draggable', true);

        // Add event listeners for drag and drop
        element.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text', element.id);
        });

        element.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        element.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedElementId = e.dataTransfer.getData('text');
            const draggedElement = document.getElementById(draggedElementId);
            const targetElement = e.target;

            // Move the dragged element to the target element
            targetElement.appendChild(draggedElement);
        });
    }
}

// Load external QR code library dynamically
function loadQRCodeLibrary() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Initialize the board after QR code library is loaded
loadQRCodeLibrary()
    .then(() => {
        window.qrcode = qrcode; // Make qrcode globally available
        new BranchBoard();
    })
    .catch(error => {
        console.error('Failed to load QR code library', error);
    });
