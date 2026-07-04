
// Game constants
const MAX_PUZZLE_WIDTH = 640;
const MAX_PUZZLE_HEIGHT = 480;
const PIECE_SIZE = 160;

const canvasEl = document.createElement('canvas');
const boardSpaceEl = document.getElementById('board-space');
const gameSpaceEl = document.getElementById('game-space');
const startBtn = document.getElementById('startBtn');
const origImage = new Image();

// Start the puzzle
window.addEventListener('load', () => {
    console.log('Image loaded');
    gameSpaceEl.addEventListener('dragover', onDragOverHandler);
    gameSpaceEl.addEventListener('drop', onDropHandler);
    initBoardSlots();
});
origImage.crossOrigin = "anonymous";
origImage.src = 'images/image1.jpg';
startBtn.addEventListener('click', () => {
    document.getElementById('instructions').style.display = 'none';
});

let puzzleSlots = [];

const initBoardSlots = () => {
    let col = 0, row = 0, pieceId = 0;
    let imgX, imgY, puzzlePiece;
    let imageData;
    let cContext = canvasEl.getContext('2d');
    canvasEl.width = PIECE_SIZE;
    canvasEl.height = PIECE_SIZE;
    boardSpaceEl.style.width = origImage.width + 'px';
    boardSpaceEl.style.height = origImage.height + 'px';

    // Clear the board space if it's not empty
    document.querySelectorAll(".puzzle-slot,.puzzle-piece").forEach((node) => {
        gameSpaceEl.removeChild(node);
    });

    // While we're still in the image size, slice and dice into separate pieces
    while ( col * PIECE_SIZE < origImage.width && row * PIECE_SIZE < origImage.height ) {
        imgX = col * PIECE_SIZE;
        imgY = row * PIECE_SIZE;

        // Draw the image piece to export to a data URI
        cContext.drawImage(origImage, imgX, imgY, PIECE_SIZE, PIECE_SIZE, 0, 0, PIECE_SIZE, PIECE_SIZE);
        imageData = canvasEl.toDataURL();

        // Create the puzzle piece element
        puzzlePiece = document.createElement('img');
        puzzlePiece.classList.add('puzzle-piece', 'unanchored');
        puzzlePiece.id = `puzzle-piece-${pieceId}`;
        puzzlePiece.src = imageData;
        puzzlePiece.draggable = true;
        puzzlePiece.addEventListener('dragstart', onDragStartHandler, false);
        puzzlePiece.addEventListener('drag', onDragHandler, false);
        puzzlePiece.addEventListener('dragend', onDragEndHandler, false);
        // Randomize the position
        puzzlePiece.style.top = Math.floor(Math.random() * (gameSpaceEl.clientHeight - PIECE_SIZE)) + 'px';
        puzzlePiece.style.left = Math.floor(Math.random() * (gameSpaceEl.clientWidth - PIECE_SIZE)) + 'px';
        gameSpaceEl.appendChild(puzzlePiece);

        // Create the puzzle slot
        let slot = document.createElement('div');
        slot.classList.add('puzzle-slot', 'empty');
        slot.addEventListener('dragover', onAllowDropHandler, false);
        slot.addEventListener('drop', onDropHandler, false);
        boardSpaceEl.appendChild(slot);

        pieceId++;
        col++;
        if ( col * PIECE_SIZE >= origImage.width ) {
            col = 0;
            row++;
        }
    }
};

const onDragStartHandler = (event) => {
    // Store some handy info we'll need to handle the dragging and eventual dropping
    const dragStart = {
        elementId: event.target.id,
        dragOffsetX: event.layerX,
        dragOffsetY: event.layerY
    }
    event.dataTransfer.setData('application/json', JSON.stringify(dragStart));
    event.dataTransfer.setData('text/plain', JSON.stringify(dragStart));

    // Clone the target so we can drag it around the screen instead of the original
    const dragImage = event.target.cloneNode(true);
    dragImage.id = "dragimage";
    dragImage.style.pointerEvents = "none";
    // dragImage.style.top = event.layerY - event.offsetY;
    // dragImage.style.left = event.layerX - event.offsetX;
    gameSpaceEl.appendChild(dragImage);
    gameSpaceEl.classList.add("dragging");
    event.dataTransfer.setDragImage(event.target, event.layerX, event.layerY);

    // gameSpaceEl.appendChild(event.target);
    console.log("&piece", event);
    // Hide the original until the user is done dragging it around
    setTimeout(() => {
        event.target.classList.add("hidden");
    }, 0);
};

const onDragHandler = (event) => {
    // Move our actual element with the cursor

    // !!!! NOTE !!!!
    // A known 14-year old bug means drag events have pointer X/Y values 
    // set to 0, making attempting to move the actual element with the mouse
    // completely useless.
    //
    // https://stackoverflow.com/questions/11656061/why-is-event-clientx-incorrectly-showing-as-0-in-firefox-for-dragend-event
};

const onDragOverHandler = (event) => {
    event.preventDefault();

    // Workaround for the Firefox bug ... listen for the drag at
    // the parent element!
    const dragInfo = JSON.parse(event.dataTransfer.getData('application/json') || event.dataTransfer.getData('text/plain'));
    const dragImage = document.getElementById("dragimage");
    if (dragImage) {
        const offsetX = (event.target.id == gameSpaceEl.id) ? event.offsetX : event.offsetX + event.target.offsetLeft;
        const offsetY = (event.target.id == gameSpaceEl.id) ? event.offsetY : event.offsetY + event.target.offsetTop;
        dragImage.style.left = (offsetX - dragInfo.dragOffsetX) + "px";
        dragImage.style.top = (offsetY - dragInfo.dragOffsetY) + "px";
        console.log("dragover", event, dragInfo);
    }
};

const onAllowDropHandler = (event) => {
    // Hide the default icon indicator
    event.preventDefault();
};

const onDropHandler = (event) => {
    event.preventDefault();
    event.stopPropagation();

    // Pull the info of the piece being dragged
    console.log("drop", event);
    const dragInfo = JSON.parse(event.dataTransfer.getData('application/json') || event.dataTransfer.getData('text/plain'));
    const piece = document.getElementById(dragInfo.elementId);
    let slot = event.target;

    if ( slot.tagName.toLowerCase() !== 'div' ) {
        slot = event.target.closest('.puzzle-slot') || event.target.closest('#game-space');
    }
    if ( slot.classList.contains('puzzle-slot') ) {
        piece.style.top = 0;
        piece.style.left = 0;
        slot.appendChild(piece);
    }
    else {
        piece.style.top = (event.offsetY - dragInfo.dragOffsetY) + 'px';
        piece.style.left = (event.offsetX - dragInfo.dragOffsetX) + 'px';
        gameSpaceEl.appendChild(piece);
    }
    document.getElementById("dragimage")?.remove();
    piece.classList.remove("hidden");
};

const onDragEndHandler = (event) => {
    const dragInfo = JSON.parse(event.dataTransfer.getData('application/json') || event.dataTransfer.getData('text/plain'));
    const piece = document.getElementById(dragInfo.elementId);
    document.getElementById("dragimage")?.remove();
    console.log("dragend", event);
    piece.classList.remove("hidden");
    gameSpaceEl.classList.remove("dragging");
};

