
// Game constants
const MAX_PUZZLE_WIDTH = 640;
const MAX_PUZZLE_HEIGHT = 480;
const PIECE_SIZE = 160;

const canvasEl = document.createElement("canvas");
const puzzleSelectEl = document.getElementById("puzzle-select");
const boardSpaceEl = document.getElementById("board-space");
const gameSpaceEl = document.getElementById("game-space");
const congratsEl = document.getElementById("congrats");
const playAgainBtn = document.getElementById("playagainBtn");
let dragInfo;

// Start the puzzle when the window loads
window.addEventListener("load", () => {
    console.log("Window loaded");
    const puzzleImages = puzzleSelectEl.querySelectorAll("img");
    puzzleImages.forEach((img) => {
        img.addEventListener("click", onPuzzleSelectHandler);
    });
    gameSpaceEl.addEventListener("mousemove", onMouseMoveHandler);
    gameSpaceEl.addEventListener("mouseup", onMouseUpHandler);
    // TODO: Handle window resize!
    //initBoard();
});
playAgainBtn.addEventListener("click", () => {
    congratsEl.style.display = "none";
    gameSpaceEl.classList.remove("active");
    puzzleSelectEl.classList.add("active");
});


/**
 *  Player has selected a puzzle
 *
 */
const onPuzzleSelectHandler = (event) => {
    if (event.target.src !== "") {
        puzzleSelectEl.classList.remove("active");
        gameSpaceEl.classList.add("active");
        // This timeout might not be necessary, but let's be sure the 
        // game space element is fully loaded before mucking about with it
        setTimeout(() => initBoard(event.target), 0);
    }
};

/**
 *  Initialize the game board, the puzzle pieces and their slots.
 *
 *  TODO: Custom size/piece count?
 *  TODO: Custom image?
 */
const initBoard = (origImage) => {
    // Initial values and settings
    let col = 0, row = 0, pieceId = 0;
    let imgX, imgY, puzzlePiece;
    let imageData;
    let cContext = canvasEl.getContext("2d");
    canvasEl.width = PIECE_SIZE;
    canvasEl.height = PIECE_SIZE;
    boardSpaceEl.style.width = origImage.width + "px";
    boardSpaceEl.style.height = origImage.height + "px";

    // Clear the board space if it"s not empty
    document.querySelectorAll(".puzzle-slot,.puzzle-piece").forEach((node) => {
        node.remove();
    });

    // Slice and dice the image into separate pieces, and create the puzzle bits
    while ( col * PIECE_SIZE < origImage.width && row * PIECE_SIZE < origImage.height ) {
        imgX = col * PIECE_SIZE;
        imgY = row * PIECE_SIZE;

        // Draw the image piece to export to a data URI
        cContext.drawImage(origImage, imgX, imgY, PIECE_SIZE, PIECE_SIZE, 0, 0, PIECE_SIZE, PIECE_SIZE);
        imageData = canvasEl.toDataURL();

        // Create the puzzle piece element (img)
        puzzlePiece = document.createElement("img");
        puzzlePiece.classList.add("puzzle-piece");
        puzzlePiece.id = `puzzle-piece-${pieceId}`;
        puzzlePiece.dataset["target"] = `puzzle-slot-${pieceId}`;
        puzzlePiece.src = imageData;
        puzzlePiece.draggable = false;
        puzzlePiece.addEventListener("mousedown", onMouseDownHandler, false);

        // Randomize the position within the game space before adding it
        puzzlePiece.style.top = Math.floor(Math.random() * (gameSpaceEl.clientHeight - PIECE_SIZE)) + 'px';
        puzzlePiece.style.left = Math.floor(Math.random() * (gameSpaceEl.clientWidth - PIECE_SIZE)) + "px";
        gameSpaceEl.appendChild(puzzlePiece);

        // Create the puzzle slot
        let slot = document.createElement("div");
        slot.id = `puzzle-slot-${pieceId}`; // This should match "target" in the piece above
        slot.classList.add("puzzle-slot", "empty");
        boardSpaceEl.appendChild(slot);

        // Increment, and wrap if we've hit the last of the row
        pieceId++;
        col++;
        if ( col * PIECE_SIZE >= origImage.width ) {
            col = 0;
            row++;
        }
    }
};

/**
 *  Listener on puzzle pieces to begin the dragging
 */
const onMouseDownHandler = (event) => {
    event.preventDefault();

    // Ensure we're dealing with a puzzle piece
    if (event.target.classList.contains("puzzle-piece")) {
        // Begin "dragging" the piece
        dragInfo = {
            draggingEl: event.target,
            dragOffsetX: event.offsetX,
            dragOffsetY: event.offsetY,
        };
        event.target.classList.add("dragging");
    }
};

/**
 *  Listen inside the game space for any mouse up, since the dragging piece
 *  has "pointer-events: none". This makes it easier to see if the player is
 *  letting go above a puzzle slot, and if it's the target for the piece
 */
const onMouseUpHandler = (event) => {
    // Handle the "drop"
    if (dragInfo && dragInfo.draggingEl) {
        if (event.target.id == dragInfo.draggingEl.dataset["target"]) {
            dragInfo.draggingEl.style.top = 0;
            dragInfo.draggingEl.style.left = 0;
            dragInfo.draggingEl.classList.add("anchored");
            dragInfo.draggingEl.classList.remove("dragging");
            event.target.appendChild(dragInfo.draggingEl);
        }

        // Clean up the dragging info
        dragInfo.draggingEl.classList.remove("dragging");
        dragInfo = undefined;

        // Check for win condition
        hasPlayerWon();
    }
};

/**
 *  Listen inside the game space for the mouse movement, but we only do
 *  anything if there's a piece being dragged. If there is, update its
 *  position, based on the game space offset.
 */
const onMouseMoveHandler = (event) => {
    if (dragInfo && dragInfo.draggingEl) {
        // Work out the offset - we might have a puzzle slot as the event target,
        // in which case we also want to include its offset to the game space
        const offsetX = (event.target.id == gameSpaceEl.id) ? event.offsetX : event.offsetX + event.target.offsetLeft;
        const offsetY = (event.target.id == gameSpaceEl.id) ? event.offsetY : event.offsetY + event.target.offsetTop;

        // Update the position of the piece element
        dragInfo.draggingEl.style.left = (offsetX - dragInfo.dragOffsetX) + "px";
        dragInfo.draggingEl.style.top = (offsetY - dragInfo.dragOffsetY) + "px";
    }
};

/**
 *  Return all unanchored puzzle pieces
 */
const getUnanchoredPieces = () => {
    return gameSpaceEl.querySelectorAll('.puzzle-piece:not(.anchored)');
};

/**
 *  Check for win condition - that is, no unanchored pieces remain
 */
const hasPlayerWon = () => {
    const remainingPieces = getUnanchoredPieces();
    if (remainingPieces.length === 0) {
        // No pieces remain - player has won!
        // Show the "Congrats" modal with the "Play again" button
        congratsEl.style.display = "block";
        congratsEl.classList.add("slidedown");
    }
};

