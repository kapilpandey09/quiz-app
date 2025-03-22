const gameBoard = document.getElementById('game-board');
const scoreEl = document.getElementById('score-value');
const movesEl = document.getElementById('moves-value');
const restartButton = document.getElementById('restart');
const prizeInfoEl = document.querySelector('.prize-info');
const productImageEl = document.querySelector('.product-image');

// Array of gadget images with working URLs
const gadgetImages = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', // Headphones
    'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500', // Smart Watch
    'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500', // Wireless Earbuds
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', // Smartphone
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500', // Tablet
    'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=500', // Gaming Console
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500', // Laptop
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500'  // Camera
];

// Array of background images for boxes
const boxImages = [
    'https://img.freepik.com/free-vector/abstract-geometric-pattern-background_53876-124047.jpg',
    'https://img.freepik.com/free-vector/abstract-geometric-pattern-background_53876-124048.jpg',
    'https://img.freepik.com/free-vector/abstract-geometric-pattern-background_53876-124049.jpg',
    'https://img.freepik.com/free-vector/abstract-geometric-pattern-background_53876-124050.jpg'
];

let boxes = [];
let totalScore = 0;
let clicks = 0;
const MAX_CLICKS = 3;
let PRIZE_THRESHOLD;

function getRandomPrizeThreshold() {
    // Generate random number between 150 and 300
    return Math.floor(Math.random() * (300 - 150 + 1)) + 150;
}

function getRandomPoints() {
    const random = Math.random() * 100;
    if (random < 10) return 50; // 10% chance for 50 points
    if (random < 30) return 20; // 20% chance for 20 points
    return 10; // 70% chance for 10 points
}

function createBoard() {
    // Clear the game board
    gameBoard.innerHTML = '';
    boxes = [];
    totalScore = 0;
    clicks = 0;
    
    // Generate new random prize threshold
    PRIZE_THRESHOLD = getRandomPrizeThreshold();
    prizeInfoEl.textContent = `Win Prize: ${PRIZE_THRESHOLD} Points`;
    
    // Set random gadget image
    const randomGadget = gadgetImages[Math.floor(Math.random() * gadgetImages.length)];
    productImageEl.src = randomGadget;
    productImageEl.onerror = function() {
        // If image fails to load, try a different one
        const newRandomGadget = gadgetImages[Math.floor(Math.random() * gadgetImages.length)];
        productImageEl.src = newRandomGadget;
    };
    
    // Update display
    scoreEl.textContent = totalScore;
    movesEl.textContent = `${clicks}/${MAX_CLICKS}`;
    
    // Create 16 boxes
    for (let i = 0; i < 16; i++) {
        const box = document.createElement('div');
        box.className = 'box';
        box.dataset.index = i;
        box.dataset.points = getRandomPoints();
        
        // Create front and back faces
        const front = document.createElement('div');
        front.className = 'box-front';
        front.textContent = box.dataset.points;
        
        const back = document.createElement('div');
        back.className = 'box-back';
        // Set random background image
        const randomImage = boxImages[Math.floor(Math.random() * boxImages.length)];
        back.style.backgroundImage = `url(${randomImage})`;
        back.style.backgroundSize = 'cover';
        
        box.appendChild(front);
        box.appendChild(back);
        
        box.addEventListener('click', () => clickBox(box));
        gameBoard.appendChild(box);
        boxes.push(box);
    }
    
    // Track board creation
    gtag('event', 'board_created', {
        'event_category': 'gameplay',
        'event_label': 'board_created'
    });
}

function clickBox(box) {
    if (box.classList.contains('clicked') || clicks >= MAX_CLICKS) return;
    
    box.classList.add('clicked');
    clicks++;
    movesEl.textContent = `${clicks}/${MAX_CLICKS}`;
    
    // Add points
    const points = parseInt(box.dataset.points);
    totalScore += points;
    scoreEl.textContent = totalScore;
    
    // Track box click event
    gtag('event', 'box_click', {
        'event_category': 'gameplay',
        'event_label': 'box_click',
        'value': points
    });
    
    // Show points animation
    showPointsAnimation(box, points);
    
    // Change box color based on points
    const front = box.querySelector('.box-front');
    if (points === 50) {
        front.style.backgroundColor = '#FFD700'; // Gold for 50 points
    } else if (points === 20) {
        front.style.backgroundColor = '#C0C0C0'; // Silver for 20 points
    } else {
        front.style.backgroundColor = '#CD7F32'; // Bronze for 10 points
    }

    // Check if game is over
    if (clicks >= MAX_CLICKS) {
        setTimeout(() => {
            let message = '';
            if (totalScore >= PRIZE_THRESHOLD) {
                message = `🎉 Congratulations! You won the prize with ${totalScore} points! 🎉\nTarget was ${PRIZE_THRESHOLD} points`;
                // Track game win event
                gtag('event', 'game_win', {
                    'event_category': 'gameplay',
                    'event_label': 'game_win',
                    'value': totalScore
                });
            } else {
                message = `Game Over! You scored ${totalScore} points.\nTarget was ${PRIZE_THRESHOLD} points.\nTry again to win the prize!`;
                // Track game lose event
                gtag('event', 'game_lose', {
                    'event_category': 'gameplay',
                    'event_label': 'game_lose',
                    'value': totalScore
                });
            }
            alert(message);
            // Disable all unclicked boxes
            boxes.forEach(box => {
                if (!box.classList.contains('clicked')) {
                    box.style.cursor = 'not-allowed';
                    box.style.opacity = '0.5';
                }
            });
        }, 500);
    }
}

function showPointsAnimation(box, points) {
    const pointsEl = document.createElement('div');
    pointsEl.className = 'points-animation';
    pointsEl.textContent = `+${points}`;
    box.appendChild(pointsEl);
    
    setTimeout(() => {
        pointsEl.remove();
    }, 1000);
}

restartButton.addEventListener('click', () => {
    // Track new game event
    gtag('event', 'new_game', {
        'event_category': 'gameplay',
        'event_label': 'new_game'
    });
    createBoard();
});

// Start the game
createBoard();