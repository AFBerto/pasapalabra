// Verificar carga inicial y registrar eventos
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, scripts.js ejecutado');

    // Verificar si Firebase está definido
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK no está cargado. Verifica los scripts en index.html.');
        return;
    }

    // Inicializar Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyCWwQ29JKeL6cM8Q7_2K8KJQh_aiBqiOt8",
        authDomain: "pasapalabra-dcf33.firebaseapp.com",
        projectId: "pasapalabra-dcf33",
        storageBucket: "pasapalabra-dcf33.firebasestorage.app",
        messagingSenderId: "93392449348",
        appId: "1:93392449348:web:6072bce3391aefc8c03111",
        measurementId: "G-KZQ4Q8K3KH"
    };
    try {
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase inicializado');
    } catch (error) {
        console.error('Error al inicializar Firebase: ' + error);
        return;
    }

    // Inicializar Firestore
    window.db = null;
    try {
        window.db = firebase.firestore();
        console.log('Firestore inicializado');
    } catch (error) {
        console.error('Error al inicializar Firestore: ' + error);
        return;
    }

    // Listar documentos en roscoQuestions para depuración
    async function listDocuments() {
        try {
            const querySnapshot = await window.db.collection('roscoQuestions').get();
            if (querySnapshot.empty) {
                console.error('La colección roscoQuestions está vacía');
            } else {
                querySnapshot.forEach(doc => {
                    console.log('Documento encontrado: ' + doc.id);
                });
            }
        } catch (error) {
            console.error('Error al listar documentos: ' + error);
        }
    }
    listDocuments();

    // Verificar botones de categoría
    const categoryButtons = document.querySelectorAll('.category-buttons img');
    if (categoryButtons.length === 0) {
        console.error('No se encontraron botones de categoría con la clase .category-buttons img');
    } else {
        categoryButtons.forEach(function(button) {
            console.log('Botón de categoría ' + button.alt + ' encontrado con onclick: ' + button.onclick);
        });
    }

    // Verificar botones de nivel
    const levelButtons = document.querySelectorAll('.level-buttons img');
    if (levelButtons.length === 0) {
        console.error('No se encontraron botones de nivel con la clase .level-buttons img');
    } else {
        levelButtons.forEach(function(button) {
            console.log('Botón de nivel ' + button.alt + ' encontrado con onclick: ' + button.onclick);
        });
    }

    // Botón para iniciar el rosco
    const roscoStartButton = document.getElementById('roscoStartButton');
    if (roscoStartButton) {
        roscoStartButton.addEventListener('click', startRoscoGame);
        console.log('Evento click registrado para roscoStartButton');
    } else {
        console.error('Elemento #roscoStartButton no encontrado');
    }

    // Botón para volver a la selección de nivel
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', returnToLevelSelection);
        console.log('Evento click registrado para backButton');
    } else {
        console.error('Elemento #backButton no encontrado');
    }

    // Botón para volver a la selección de categoría
    const backToCategoryButton = document.getElementById('backToCategoryButton');
    if (backToCategoryButton) {
        backToCategoryButton.addEventListener('click', returnToCategorySelection);
        console.log('Evento click registrado para backToCategoryButton');
    } else {
        console.error('Elemento #backToCategoryButton no encontrado');
    }

    // Botón de inicio del juego
    const startButton = document.getElementById('startButton');
    if (startButton) {
        startButton.addEventListener('click', startGame);
        console.log('Evento click registrado para startButton');
    } else {
        console.error('Elemento #startButton no encontrado');
    }

    // Botón de reinicio
    const restartButton = document.getElementById('restartButton');
    if (restartButton) {
        restartButton.addEventListener('click', restartGame);
        console.log('Evento click registrado para restartButton');
    } else {
        console.error('Elemento #restartButton no encontrado');
    }

    // Listener global para depurar clics
    document.addEventListener('click', function(event) {
        console.log('Clic detectado en: ' + event.target + ', ID: ' + event.target.id + ', Alt: ' + event.target.alt);
    });
});

// Estructura de roscos por categoría y nivel
const availableRoscos = {
    fisica: {
        eso2: [
            { id: 'fisica-eso2-1', name: 'Rosco de ESO 2', level: 'ESO 2', number: 1 }
        ],
        eso3: [
            { id: 'fisica-eso3-1', name: 'Rosco de ESO 3', level: 'ESO 3', number: 1 }
        ],
        eso4: [
            { id: 'fisica-eso4-1', name: 'Rosco de ESO 4', level: 'ESO 4', number: 1 }
        ],
        bach1: [
            { id: 'fisica-bach1-1', name: 'Rosco de Bachillerato 1', level: 'Bachillerato 1', number: 1 }
        ],
        bach2: [
            { id: 'FB21', name: 'Rosco de Bachillerato 2', level: '2º de Bachillerato', number: 1 }
        ]
    },
    quimica: {
        eso2: [
            { id: 'quimica-eso2-1', name: 'Rosco de ESO 2', level: 'ESO 2', number: 1 }
        ],
        eso3: [
            { id: 'quimica-eso3-1', name: 'Rosco de ESO 3', level: 'ESO 3', number: 1 }
        ],
        eso4: [
            { id: 'quimica-eso4-1', name: 'Rosco de ESO 4', level: 'ESO 4', number: 1 }
        ],
        bach1: [
            { id: 'quimica-bach1-1', name: 'Rosco de Bachillerato 1', level: 'Bachillerato 1', number: 1 }
        ],
        bach2: [
            { id: 'quimica-bach2-1', name: 'Rosco de Bachillerato 2', level: '2º de Bachillerato', number: 1 }
        ]
    }
};

// Lista predeterminada de letras para generar el rosco (A-Z)
const roscoLetters = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'L', 'M',
    'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z'
];

// Variables globales
let currentWords = [];
let currentIndex = 0;
let passedWords = [];
let timer;
let timeLeft = 300; // 5 minutos
let gameStarted = false;
let currentRoscoId = 'fisica-eso2-1'; // Rosco inicial (Física, ESO 2)
let currentRoscoLevel = 'eso2'; // Nivel inicial (ESO 2)
let currentCategory = 'fisica'; // Categoría inicial (Física)
let correctCount = 0; // Contador de palabras acertadas
let errorCount = 0; // Contador de errores
let remainingCount = roscoLetters.length; // Contador de palabras restantes

// Función para obtener preguntas desde Firestore
async function fetchQuestions(roscoId) {
    console.log('Obteniendo preguntas para rosco ' + roscoId + ' desde Firestore');
    if (!window.db) {
        console.error('Firestore no está inicializado. No se puede acceder a db.');
        return [];
    }
    try {
        const docRef = window.db.collection('roscoQuestions').doc(roscoId);
        const doc = await docRef.get();
        let questions = [];
        if (doc.exists) {
            const data = doc.data();
            console.log('Documento encontrado para rosco ' + roscoId + ': ' + JSON.stringify(data));
            if (!Array.isArray(data.questions)) {
                console.error('El campo questions no es un array en el documento ' + roscoId + ': ' + JSON.stringify(data.questions));
                return [];
            }
            questions = (data.questions || []).slice(0, roscoLetters.length).map(function(q, index) {
                return {
                    letter: roscoLetters[index],
                    definition: q.definition,
                    answer: q.answer
                };
            });
            questions = questions.filter(function(q) {
                return q.letter && q.definition && q.answer;
            });
            console.log('Preguntas procesadas: ' + questions.length);
        } else {
            console.error('No se encontró el documento para rosco ' + roscoId + ' en la colección roscoQuestions');
        }
        return questions;
    } catch (error) {
        console.error('Error al obtener las preguntas desde Firestore para rosco ' + roscoId + ': ' + error);
        return [];
    }
}

// Función para simular la verificación de una respuesta en el servidor
async function checkAnswerServer(roscoId, letterIndex, userAnswer) {
    console.log('Verificando respuesta para rosco ' + roscoId + ', letra ' + letterIndex);
    if (!window.db) {
        console.error('Firestore no está inicializado. No se puede acceder a db.');
        return { isCorrect: false, correctAnswer: null };
    }
    try {
        const docRef = window.db.collection('roscoQuestions').doc(roscoId);
        const doc = await docRef.get();
        if (doc.exists) {
            const data = doc.data();
            const question = data.questions[letterIndex];
            if (!question) {
                console.error('No se encontró definición para la letra ' + letterIndex + ' en rosco ' + roscoId);
                return { isCorrect: false, correctAnswer: null };
            }
            const isCorrect = userAnswer.trim().toLowerCase() === question.answer.toLowerCase();
            console.log('Respuesta del usuario: ' + userAnswer + ', Respuesta correcta: ' + question.answer + ', ¿Correcta?: ' + isCorrect);
            return { isCorrect: isCorrect, correctAnswer: question.answer };
        } else {
            console.error('No se encontró el documento para rosco ' + roscoId);
            return { isCorrect: false, correctAnswer: null };
        }
    } catch (error) {
        console.error('Error al verificar la respuesta desde Firestore: ' + error);
        return { isCorrect: false, correctAnswer: null };
    }
}

// Seleccionar categoría (Física o Química)
function selectCategory(category) {
    console.log('selectCategory ejecutado con categoría: ' + category);

    // Validar categoría
    if (category !== 'fisica' && category !== 'quimica') {
        console.error('Categoría no reconocida: ' + category);
        return;
    }

    // Guardar la categoría seleccionada
    currentCategory = category;
    console.log('Categoría seleccionada: ' + currentCategory);

    // Ocultar la pantalla de selección de categoría
    const categorySelection = document.getElementById('categorySelection');
    if (categorySelection) {
        categorySelection.style.display = 'none';
        console.log('#categorySelection ocultado');
    } else {
        console.error('Elemento #categorySelection no encontrado');
    }

    // Mostrar la pantalla de selección de nivel
    const levelSelection = document.getElementById('levelSelection');
    if (levelSelection) {
        levelSelection.style.display = 'block';
        console.log('#levelSelection mostrado');
    } else {
        console.error('Elemento #levelSelection no encontrado');
    }
}

// Seleccionar nivel
function selectLevel(level) {
    console.log('selectLevel ejecutado con nivel: ' + level);

    // Validar que haya una categoría seleccionada
    if (!currentCategory) {
        console.error('No se ha seleccionado una categoría antes de elegir el nivel');
        return;
    }

    // Verificar si el nivel existe dentro de la categoría seleccionada
    if (!availableRoscos[currentCategory] || !availableRoscos[currentCategory][level]) {
        console.error('Nivel ' + level + ' no reconocido para la categoría ' + currentCategory);
        return;
    }

    const rosco = availableRoscos[currentCategory][level][0];
    if (!rosco) {
        console.error('No se encontraron roscos para el nivel ' + level + ' en la categoría ' + currentCategory);
        return;
    }

    console.log('Rosco seleccionado: ' + JSON.stringify(rosco));

    currentRoscoId = rosco.id;
    currentRoscoLevel = level;

    fetchQuestions(currentRoscoId).then(function(words) {
        console.log('Preguntas cargadas: ' + JSON.stringify(words));
        currentWords = words;

        if (currentWords.length === 0) {
            console.error('No se cargaron definiciones para el rosco ' + currentRoscoId);
            const roscoCenter = document.getElementById('roscoCenter');
            if (roscoCenter) {
                roscoCenter.innerHTML = '<p class="error-message">No se encontraron preguntas para el rosco ' + currentRoscoId + '. Por favor, verifica la base de datos.</p>';
            }
            return;
        }

        correctCount = 0;
        errorCount = 0;
        remainingCount = currentWords.length;
        updateCounters();

        console.log('currentWords asignado, longitud: ' + currentWords.length + ', roscoId: ' + currentRoscoId + ', level: ' + currentRoscoLevel);

        const levelSelection = document.getElementById('levelSelection');
        if (levelSelection) {
            levelSelection.style.display = 'none';
            console.log('#levelSelection ocultado');
        } else {
            console.error('Elemento #levelSelection no encontrado');
        }

        const gameContent = document.getElementById('gameContent');
        if (gameContent) {
            gameContent.style.display = 'block';
            console.log('#gameContent mostrado');
        } else {
            console.error('Elemento #gameContent no encontrado');
        }

        const roscoCenter = document.getElementById('roscoCenter');
        const rotatingImage = document.getElementById('rotatingImage');
        const backButton = document.getElementById('backButton');
        if (roscoCenter) {
            roscoCenter.style.display = 'flex';
            roscoCenter.style.animation = 'none';
            roscoCenter.style.opacity = '1';
            console.log('#roscoCenter mostrado');
        } else {
            console.error('Elemento #roscoCenter no encontrado');
        }
        if (rotatingImage) {
            rotatingImage.style.display = 'block';
            rotatingImage.style.animation = 'rotate 50s linear infinite';
            rotatingImage.style.opacity = '1';
            console.log('#rotatingImage mostrado');
        } else {
            console.error('Elemento #rotatingImage no encontrado');
        }
        if (backButton) {
            backButton.style.display = 'block';
            console.log('#backButton mostrado');
        } else {
            console.error('Elemento #backButton no encontrado');
        }

        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.style.display = 'block';
            console.log('#startButton mostrado');
        } else {
            console.error('Elemento #startButton no encontrado');
        }

        const roscoTitle = document.querySelector('.rosco-title');
        if (roscoTitle) {
            const categoryText = currentCategory === 'fisica' ? 'Física' : 'Química';
            roscoTitle.innerHTML = '<span class="rosco-line1">Vas a jugar al</span><span class="rosco-line2">Rosco de ' + categoryText + '</span><span class="rosco-level">Nivel: ' + rosco.level + '</span>';
            console.log('Título del rosco actualizado');
        } else {
            console.error('Elemento .rosco-title no encontrado');
        }

        gameStarted = false;
        currentIndex = 0;
        passedWords = [];
        timeLeft = 300;
        if (timer) {
            clearInterval(timer);
            timer = null;
            console.log('Temporizador reiniciado');
        }

        initializeRosco();
    }).catch(function(error) {
        console.error('Error al cargar las preguntas para rosco ' + currentRoscoId + ': ' + error);
        const roscoCenter = document.getElementById('roscoCenter');
        if (roscoCenter) {
            roscoCenter.innerHTML = '<p class="error-message">No se encontraron preguntas para el rosco ' + currentRoscoId + '. Por favor, verifica la base de datos.</p>';
        }
    });
}

// Inicializar el rosco
function initializeRosco() {
    console.log('initializeRosco ejecutado');
    const rosco = document.getElementById('rosco');
    if (!rosco) {
        console.error('Elemento #rosco no encontrado');
        return;
    }

    const radius = 260;
    const centerX = 300;
    const centerY = 240;

    // Limpiar elementos previos, conservando los fijos
    rosco.querySelectorAll('.letter, #questionContainer, #errorContainer').forEach(function(element) {
        element.remove();
    });

    const rotatingImage = document.getElementById('rotatingImage');
    const roscoCenter = document.getElementById('roscoCenter');
    const timerDisplay = document.getElementById('timerDisplay');
    const correctCountDisplay = document.getElementById('correctCountDisplay');
    const errorCountDisplay = document.getElementById('errorCountDisplay');
    const remainingCountDisplay = document.getElementById('remainingCountDisplay');
    const backButton = document.getElementById('backButton');

    if (rotatingImage) {
        rotatingImage.style.display = 'block';
        rotatingImage.style.animation = 'rotate 50s linear infinite';
        rotatingImage.style.opacity = '1';
        rotatingImage.style.transform = 'translate(-50%, -50%) scale(1)';
        rosco.appendChild(rotatingImage);
        console.log('Elemento #rotatingImage añadido al rosco');
    }
    if (roscoCenter) {
        roscoCenter.style.display = 'flex';
        roscoCenter.style.animation = 'none';
        roscoCenter.style.opacity = '1';
        roscoCenter.style.transform = 'translate(-50%, -50%) scale(1)';
        rosco.appendChild(roscoCenter);
        console.log('Elemento #roscoCenter añadido al rosco');
    }
    if (timerDisplay) {
        rosco.appendChild(timerDisplay);
        console.log('Elemento #timerDisplay añadido al rosco');
    }
    if (correctCountDisplay) {
        rosco.appendChild(correctCountDisplay);
    }
    if (errorCountDisplay) {
        rosco.appendChild(errorCountDisplay);
    }
    if (remainingCountDisplay) {
        rosco.appendChild(remainingCountDisplay);
    }
    if (backButton) {
        rosco.appendChild(backButton);
        console.log('Elemento #backButton añadido al rosco');
    }

    // Generar letras solo para las definiciones disponibles
    currentWords.forEach(function(word, index) {
        console.log('Procesando letra ' + word.letter + ' (índice ' + index + ')');
        const letterImg = document.createElement('img');
        letterImg.className = 'letter';
        letterImg.id = 'letter-' + index;
        letterImg.src = 'images/' + word.letter.toLowerCase() + '.png';
        letterImg.style.width = '50px';
        letterImg.style.height = '50px';

        letterImg.onerror = function() {
            console.error('Error al cargar la imagen: images/' + word.letter.toLowerCase() + '.png');
        };
        letterImg.onload = function() {
            console.log('Imagen cargada correctamente: images/' + word.letter.toLowerCase() + '.png');
        };

        const angle = (index / currentWords.length) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        letterImg.style.left = 'calc(' + x + 'px - 25px)';
        letterImg.style.top = 'calc(' + y + 'px - 25px)';

        rosco.appendChild(letterImg);
        console.log('Letra ' + word.letter + ' añadida al DOM');
    });
    console.log('Rosco inicializado con ' + currentWords.length + ' letras');
}

// Iniciar el juego del rosco
function startRoscoGame() {
    console.log('startRoscoGame ejecutado');

    const rotatingImage = document.getElementById('rotatingImage');
    const roscoCenter = document.getElementById('roscoCenter');

    if (rotatingImage && roscoCenter) {
        rotatingImage.style.animation = 'none';
        rotatingImage.style.animation = 'growAndShrinkFade 1s ease-in-out forwards';
        roscoCenter.style.animation = 'growAndShrinkFade 1s ease-in-out forwards';

        setTimeout(function() {
            rotatingImage.style.display = 'none';
            roscoCenter.style.display = 'none';
            console.log('RotatingImage y roscoCenter ocultados');

            const rosco = document.getElementById('rosco');
            const existingQuestionContainer = document.getElementById('questionContainer');
            if (existingQuestionContainer) {
                existingQuestionContainer.remove();
            }

            const questionContainer = document.createElement('div');
            questionContainer.id = 'questionContainer';
            questionContainer.innerHTML = '<div class="question-box"><p class="question-text">EMPIEZA POR A</p></div><p id="definition">Esperando definición...</p><input type="text" id="answerInput" class="answer-input" placeholder="ESCRIBE AQUÍ TU RESPUESTA"><p id="feedback"></p><button id="okButton" class="action-button" tabindex="-1"><img src="images/respuesta.png" alt="Responder" class="action-img" data-original="images/respuesta.png" data-hover="images/respuestaw.png"></button><button id="passButton" class="action-button"><img src="images/pasapalabra.png" alt="Pasapalabra" class="action-img" data-original="images/pasapalabra.png" data-hover="images/pasapalabraw.png"></button>';
            rosco.appendChild(questionContainer);
            console.log('Contenedor de pregunta añadido');

            const okButton = document.getElementById('okButton');
            const passButton = document.getElementById('passButton');

            if (okButton) {
                okButton.addEventListener('click', checkAnswer);
                console.log('Evento click registrado para okButton');
            } else {
                console.error('Elemento #okButton no encontrado');
            }

            if (passButton) {
                passButton.addEventListener('click', passWord);
                console.log('Evento click registrado para passButton');
            } else {
                console.error('Elemento #passButton no encontrado');
            }

            document.querySelectorAll('.action-button').forEach(function(button) {
                const img = button.querySelector('.action-img');
                const originalSrc = img.getAttribute('data-original');
                const hoverSrc = img.getAttribute('data-hover');
                button.addEventListener('mouseover', function() {
                    img.src = hoverSrc;
                });
                button.addEventListener('mouseout', function() {
                    img.src = originalSrc;
                });
            });
            console.log('Eventos de hover registrados para los botones de acción');

            setTimeout(function() {
                startGame();
            }, 100);
        }, 1000);
    } else {
        console.error('Elemento #rotatingImage o #roscoCenter no encontrado');
    }
}

// Iniciar el juego
function startGame() {
    console.log('startGame ejecutado');
    if (!gameStarted) {
        gameStarted = true;
        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.style.display = 'none';
            console.log('#startButton ocultado');
        }
        loadQuestion(0);
        console.log('Juego iniciado');
    }
}

// Actualizar contadores
function updateCounters() {
    console.log('updateCounters ejecutado');
    const correctCountElement = document.getElementById('correctCount');
    const errorCountElement = document.getElementById('errorCount');
    const remainingCountElement = document.getElementById('remainingCount');
    if (correctCountElement) {
        correctCountElement.textContent = correctCount;
    } else {
        console.error('Elemento #correctCount no encontrado');
    }
    if (errorCountElement) {
        errorCountElement.textContent = errorCount;
    } else {
        console.error('Elemento #errorCount no encontrado');
    }
    if (remainingCountElement) {
        remainingCountElement.textContent = remainingCount;
    } else {
        console.error('Elemento #remainingCount no encontrado');
    }
}

// Ajustar tamaño de fuente de la definición
function adjustDefinitionFontSize(definitionElement, text) {
    console.log('adjustDefinitionFontSize ejecutado');
    if (!definitionElement || !text) {
        console.error('definitionElement o text no están definidos: ' + JSON.stringify({ definitionElement, text }));
        return;
    }

    const maxFontSize = 24;
    const minFontSize = 16;
    let fontSize = maxFontSize;
    definitionElement.style.fontSize = fontSize + 'px';

    const tempElement = document.createElement('span');
    tempElement.style.visibility = 'hidden';
    tempElement.style.position = 'absolute';
    tempElement.style.whiteSpace = 'normal';
    tempElement.style.overflowWrap = 'break-word';
    tempElement.style.lineHeight = '1.2';
    tempElement.style.width = definitionElement.style.maxWidth;
    tempElement.style.fontFamily = '"Nunito", sans-serif';
    tempElement.style.fontWeight = '700';
    tempElement.textContent = text;
    document.body.appendChild(tempElement);

    while (fontSize >= minFontSize) {
        tempElement.style.fontSize = fontSize + 'px';
        const computedHeight = tempElement.offsetHeight;
        const lineHeight = parseFloat(getComputedStyle(tempElement).lineHeight);
        const maxHeight = lineHeight * 3;

        if (computedHeight <= maxHeight) {
            break;
        }
        fontSize -= 1;
    }

    definitionElement.style.fontSize = fontSize + 'px';
    document.body.removeChild(tempElement);
}

// Cargar pregunta
function loadQuestion(index) {
    console.log('loadQuestion ejecutado con index: ' + index);
    currentIndex = index;
    const word = currentWords[index] || null;
    const currentLetterElement = document.querySelector('.question-text');
    const definitionElement = document.getElementById('definition');
    const feedbackElement = document.getElementById('feedback');

    if (!currentLetterElement || !definitionElement || !feedbackElement) {
        console.error('Elementos del juego no encontrados: ' + JSON.stringify({
            currentLetterElement,
            definitionElement,
            feedbackElement
        }));
        return;
    }

    let prefix = 'EMPIEZA POR';
    if (word && word.definition && word.definition.startsWith('Contiene la')) {
        prefix = 'CONTIENE LA';
    }
    currentLetterElement.innerHTML = prefix + ' ' + roscoLetters[index];
    console.log('Pregunta mostrada: ' + prefix + ' ' + roscoLetters[index]);

    let cleanDefinition = word && word.definition ? word.definition : 'No se encontraron definiciones para esta letra.';
    if (cleanDefinition.startsWith('Con la')) {
        cleanDefinition = cleanDefinition.replace(/^Con la [A-ZÑ]:\s*/, '').trim();
    } else if (cleanDefinition.startsWith('Contiene la')) {
        cleanDefinition = cleanDefinition.replace(/^Contiene la [A-ZÑ]:\s*/, '').trim();
    }
    definitionElement.innerHTML = cleanDefinition;
    feedbackElement.innerHTML = '';

    adjustDefinitionFontSize(definitionElement, cleanDefinition);

    const answerInput = document.getElementById('answerInput');
    if (answerInput) {
        answerInput.value = '';
        console.log('answerInput encontrado y valor reseteado');
    } else {
        console.error('Elemento #answerInput no encontrado');
    }

    document.querySelectorAll('.letter').forEach(function(letter) {
        letter.classList.remove('active', 'blinking');
    });
    const currentLetter = document.getElementById('letter-' + index);
    if (currentLetter) {
        currentLetter.classList.add('active', 'blinking');
        console.log('Letra activa: letter-' + index);
    } else {
        console.error('Elemento letter-' + index + ' no encontrado');
    }

    if (!timer && timeLeft > 0) {
        console.log('Iniciando temporizador...');
        timer = setInterval(function() {
            timeLeft--;
            console.log('Tiempo restante: ' + timeLeft);
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            const timerText = document.getElementById('timerText');
            if (timerText) {
                timerText.textContent = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
            } else {
                console.error('Elemento #timerText no encontrado');
            }
            if (timeLeft <= 0) {
                clearInterval(timer);
                timer = null;
                endGame("timeUp");
            }
        }, 1000);
        console.log('Temporizador iniciado');
    } else {
        console.log('Temporizador no iniciado: ' + JSON.stringify({ timer, timeLeft }));
    }
}

// Verificar si el juego ha terminado
function checkGameEnd() {
    console.log('checkGameEnd ejecutado');
    const letters = document.querySelectorAll('.letter');
    let allAnswered = true;
    let allCorrect = true;

    letters.forEach(function(letter) {
        if (!letter.classList.contains('correct') && !letter.classList.contains('incorrect')) {
            allAnswered = false;
        }
        if (letter.classList.contains('incorrect')) {
            allCorrect = false;
        }
    });

    if (allAnswered) {
        if (allCorrect) {
            endGame("completed");
        } else {
            endGame("allAnsweredWithIncorrect");
        }
        return true;
    }
    return false;
}

// Mostrar mensaje de respuesta incorrecta
function showIncorrectMessage(letter, correctAnswer) {
    console.log('showIncorrectMessage ejecutado para letra: ' + letter + ', respuesta correcta: ' + correctAnswer);
    const rosco = document.getElementById('rosco');
    const questionContainer = document.getElementById('questionContainer');
    const backButton = document.getElementById('backButton');

    if (backButton) {
        backButton.style.display = 'none';
        console.log('#backButton ocultado durante pantalla de error');
    } else {
        console.error('Elemento #backButton no encontrado');
    }

    if (questionContainer) {
        questionContainer.style.display = 'none';
    } else {
        console.error('Elemento #questionContainer no encontrado');
    }

    const errorOverlay = document.createElement('div');
    errorOverlay.id = 'errorOverlay';
    errorOverlay.className = 'error-overlay';
    document.body.appendChild(errorOverlay);

    const errorContainer = document.createElement('div');
    errorContainer.id = 'errorContainer';
    errorContainer.className = 'error-container';
    errorContainer.innerHTML = '<p class="error-no animate-no">NO</p>';
    rosco.appendChild(errorContainer);

    setTimeout(function() {
        errorOverlay.className = 'error-overlay error-overlay-visible';
        errorContainer.innerHTML = '<div class="error-background"><div class="error-letter-container"><div class="error-circle"></div><div class="error-letter">' + letter + '</div></div><p class="error-message">La respuesta correcta era:</p><p class="correct-answer">' + correctAnswer + '</p><p class="error-prompt"><span class="prompt-line1">Aunque ya no podrías optar al bote, puedes</span><br><span class="prompt-line2">seguir completando el rosco. ¿Preparado?</span></p><button id="continueButton" class="error-continue-button"><img src="images/continue.png" alt="Continuar"></button></div>';

        const continueButton = document.getElementById('continueButton');
        continueButton.addEventListener('click', function() {
            errorOverlay.remove();
            errorContainer.remove();
            if (questionContainer) {
                questionContainer.style.display = 'flex';
            }
            if (backButton) {
                backButton.style.display = 'block';
                console.log('#backButton mostrado después de cerrar pantalla de error');
            }
            moveToNextQuestion();
        });
    }, 800);
}

// Verificar respuesta del usuario
async function checkAnswer() {
    console.log('checkAnswer ejecutado');
    const userAnswer = document.getElementById('answerInput').value;
    const feedbackElement = document.getElementById('feedback');
    const letterDiv = document.getElementById('letter-' + currentIndex);

    const result = await checkAnswerServer(currentRoscoId, currentIndex, userAnswer);
    if (result.isCorrect === false && !result.correctAnswer) {
        feedbackElement.innerHTML = 'No se ha definido una respuesta para esta letra.';
        feedbackElement.style.color = 'red';
        return;
    }

    if (result.isCorrect) {
        feedbackElement.innerHTML = '¡Correcto!';
        feedbackElement.style.color = 'green';
        letterDiv.classList.add('correct');
        letterDiv.classList.remove('blinking');
        letterDiv.src = 'images/' + currentWords[currentIndex].letter.toLowerCase() + 'v.png';
        correctCount++;
        remainingCount--;
        moveToNextQuestion();
    } else {
        letterDiv.classList.add('incorrect');
        letterDiv.classList.remove('blinking');
        letterDiv.src = 'images/' + currentWords[currentIndex].letter.toLowerCase() + 'r.png';
        errorCount++;
        remainingCount--;
        showIncorrectMessage(currentWords[currentIndex].letter, result.correctAnswer);
    }
    updateCounters();
}

// Pasar palabra
function passWord() {
    console.log('passWord ejecutado');
    if (!passedWords.includes(currentIndex)) {
        passedWords.push(currentIndex);
    }
    moveToNextQuestion();
}

// Mover a la siguiente pregunta
function moveToNextQuestion() {
    console.log('moveToNextQuestion ejecutado');

    if (checkGameEnd()) {
        return;
    }

    let nextIndex = (currentIndex + 1) % currentWords.length;
    let found = false;

    for (let i = 0; i < currentWords.length; i++) {
        if (!document.getElementById('letter-' + nextIndex).classList.contains('correct') &&
            !document.getElementById('letter-' + nextIndex).classList.contains('incorrect')) {
            loadQuestion(nextIndex);
            return;
        }
        nextIndex = (nextIndex + 1) % currentWords.length;
    }

    if (passedWords.length > 0) {
        let passedIndex = passedWords.find(function(index) {
            const letter = document.getElementById('letter-' + index);
            return !letter.classList.contains('correct') && !letter.classList.contains('incorrect');
        });

        if (passedIndex !== undefined) {
            passedWords = passedWords.filter(function(index) {
                return index !== passedIndex;
            });
            loadQuestion(passedIndex);
            return;
        }
    }

    console.error('No se encontraron letras no contestadas, pero el juego no ha terminado');
}

// Finalizar el juego
function endGame(reason) {
    console.log('endGame ejecutado con razón: ' + reason);
    clearInterval(timer);
    timer = null;
    const questionContainer = document.getElementById('questionContainer');
    const restartButton = document.getElementById('restartButton');
    const backButton = document.getElementById('backButton');

    if (backButton) {
        backButton.style.display = 'none';
    }

    let message = '';
    if (reason === "completed") {
        message = '¡Felicidades! Has completado el rosco. ¡Gran trabajo!';
    } else if (reason === "timeUp") {
        message = '¡Bien jugado! Esta vez se acabó el tiempo, pero el próximo rosco te espera.';
    } else if (reason === "allAnsweredWithIncorrect") {
        message = '¡Bien jugado! Esta vez no lo has conseguido, pero el próximo rosco te espera.';
    }

    if (questionContainer && restartButton) {
        questionContainer.innerHTML = '<p class="end-game-message">' + message + '</p>';
        restartButton.style.display = 'block';
    } else {
        console.error('Elementos para finalizar el juego no encontrados');
    }
}

// Volver a la selección de nivel
function returnToLevelSelection() {
    console.log('returnToLevelSelection ejecutado');

    if (timer) {
        clearInterval(timer);
        timer = null;
        console.log('Temporizador detenido');
    }

    currentWords = [];
    currentIndex = 0;
    passedWords = [];
    timeLeft = 300;
    gameStarted = false;
    correctCount = 0;
    errorCount = 0;
    remainingCount = roscoLetters.length;

    const timerText = document.getElementById('timerText');
    const restartButton = document.getElementById('restartButton');
    const gameContent = document.getElementById('gameContent');
    const levelSelection = document.getElementById('levelSelection');
    const backButton = document.getElementById('backButton');
    const rotatingImage = document.getElementById('rotatingImage');
    const roscoCenter = document.getElementById('roscoCenter');

    if (timerText) timerText.textContent = '5:00';
    if (restartButton) restartButton.style.display = 'none';
    if (backButton) backButton.style.display = 'none';

    if (rotatingImage) {
        rotatingImage.style.display = 'block';
        rotatingImage.style.animation = 'rotate 50s linear infinite';
        rotatingImage.style.opacity = '1';
        rotatingImage.style.transform = 'translate(-50%, -50%) scale(1)';
    }
    if (roscoCenter) {
        roscoCenter.style.display = 'flex';
        roscoCenter.style.animation = 'none';
        roscoCenter.style.opacity = '1';
        roscoCenter.style.transform = 'translate(-50%, -50%) scale(1)';
    }

    if (gameContent && levelSelection) {
        gameContent.style.display = 'none';
        levelSelection.style.display = 'block';
        console.log('Volviendo a la selección de nivel');
    } else {
        console.error('Elementos para volver a la selección de nivel no encontrados');
    }
}

// Volver a la selección de categoría
function returnToCategorySelection() {
    console.log('returnToCategorySelection ejecutado');

    const levelSelection = document.getElementById('levelSelection');
    if (levelSelection) {
        levelSelection.style.display = 'none';
        console.log('#levelSelection ocultado');
    } else {
        console.error('Elemento #levelSelection no encontrado');
    }

    const categorySelection = document.getElementById('categorySelection');
    if (categorySelection) {
        categorySelection.style.display = 'block';
        console.log('#categorySelection mostrado');
    } else {
        console.error('Elemento #categorySelection no encontrado');
    }
}

// Reiniciar el juego
function restartGame() {
    console.log('restartGame ejecutado');
    currentIndex = 0;
    passedWords = [];
    timeLeft = 300;
    gameStarted = false;
    correctCount = 0;
    errorCount = 0;
    remainingCount = currentWords.length;

    const timerText = document.getElementById('timerText');
    const restartButton = document.getElementById('restartButton');
    const startButton = document.getElementById('startButton');
    const rotatingImage = document.getElementById('rotatingImage');
    const roscoCenter = document.getElementById('roscoCenter');
    const backButton = document.getElementById('backButton');

    if (timerText) timerText.textContent = '5:00';
    if (restartButton) restartButton.style.display = 'none';
    if (startButton) startButton.style.display = 'none';
    if (rotatingImage) {
        rotatingImage.style.display = 'block';
        rotatingImage.style.animation = 'rotate 50s linear infinite';
        rotatingImage.style.opacity = '1';
        rotatingImage.style.transform = 'translate(-50%, -50%) scale(1)';
    }
    if (roscoCenter) {
        roscoCenter.style.display = 'flex';
        roscoCenter.style.animation = 'none';
        roscoCenter.style.opacity = '1';
        roscoCenter.style.transform = 'translate(-50%, -50%) scale(1)';
    }
    if (backButton) backButton.style.display = 'block';

    document.querySelectorAll('.letter').forEach(function(letter) {
        letter.classList.remove('correct', 'incorrect', 'active', 'blinking');
        const index = parseInt(letter.id.replace('letter-', ''));
        letter.src = 'images/' + currentWords[index].letter.toLowerCase() + '.png';
    });
    updateCounters();
    initializeRosco();
}
