
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
origImage.addEventListener('load', () => {
  console.log('Image loaded');
  gameSpaceEl.addEventListener('dragover', onAllowDropHandler);
  gameSpaceEl.addEventListener('drop', onDropHandler);
  initBoardSlots();
});
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
    puzzlePiece.addEventListener('dragstart', onDragStartHandler);
    // Randomize the position
    puzzlePiece.style.top = Math.floor(Math.random() * (gameSpaceEl.clientHeight - PIECE_SIZE)) + 'px';
    puzzlePiece.style.left = Math.floor(Math.random() * (gameSpaceEl.clientWidth - PIECE_SIZE)) + 'px';
    gameSpaceEl.appendChild(puzzlePiece);

    // Create the puzzle slot
    let slot = document.createElement('div');
    slot.classList.add('puzzle-slot', 'empty');
    slot.addEventListener('dragover', onAllowDropHandler);
    slot.addEventListener('drop', onDropHandler);
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
  let dragStart = {
    elementId: event.target.id,
    startX: event.layerX,
    startY: event.layerY
  }
  event.dataTransfer.setData('application/json', JSON.stringify(dragStart));
  event.dataTransfer.setData('text/plain', JSON.stringify(dragStart));
};

const onAllowDropHandler = (event) => {
  event.preventDefault();
};

const onDropHandler = (event) => {
  event.preventDefault();
  let dragInfo = JSON.parse(event.dataTransfer.getData('application/json') || event.dataTransfer.getData('text/plain'));
  let dragId = dragInfo.elementId;
  let piece = document.getElementById(dragId);
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
    piece.style.top = (event.clientY - gameSpaceEl.offsetTop - dragInfo.startY) + 'px';
    piece.style.left = (event.clientX - gameSpaceEl.offsetLeft - dragInfo.startX) + 'px';
  }
};
