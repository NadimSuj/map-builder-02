// =====================
// SETUP
// =====================

// 1. Get canvas and context (same as v1, different ID)

// 2. Constants: TILE_SIZE, and world dimensions
//    (hint: the world should be bigger than the canvas
//    so there's actually somewhere to pan to)

// 3. TILE constants object

// 4. TILE_IMAGES object (starts empty)

// 5. loadImage function

// 6. Promise.all to load all five images, populate
//    TILE_IMAGES, then call render()

const canvas = document.getElementById("mapCanvas");  //It locks into and finds the canvas element in the HTML file with the id "mapCanvas", and assigns it to the variable `canvas`. This allows the JavaScript code to interact with the canvas element, such as drawing on it or responding to user input.
const ctx = canvas.getContext("2d"); //This variable stores an object called a "CanvasRenderingContext2D" object, which gets summoned after we make the call, ".getContext('2d')" on our canvas object that we just found one line above. This object provides a set of methods and properties that allow us to draw and manipulate 2D graphics on the canvas. We can use this context to draw shapes, images, text, and more on the canvas element in our web page.

// Set canvas to fill the viewport below the toolbar
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 80; // 80px toolbar height

// World size: fixed number of tiles, bigger than viewport
const WORLD_COLS = 100;
const WORLD_ROWS = 100;
const TILE_SIZE = 32;

// Maps tile type names to string keys (same as v1)
const TILE = {
  GRASS: "grass",
  ROAD: "road",
  WATER: "water",
  BUILDING: "building",
  PARK: "park"
};

// Will map tile type keys to loaded Image objects
// Starts empty, gets populated after loading finishes
const TILE_IMAGES = {};

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      resolve(img);
    };
  });
}

/*
The above is an asynchronous image loading function, following these steps:
- A src is put into the parameter of the function, which in your case will be a file path.
- The function immediately returns a pending Promise, which acts like a background receipt telling your code that the task has started.
- Inside, the system creates a variable called img that generates a new Image object.
- The image's source is set to the src provided in the parameter, which kicks off the background download process.
- Once the image finishes loading, the onload event fires and triggers the resolve function. This is the green light signal confirming the promise is fulfilled and passing the ready-to-use image back to your code.
*/


/*

*As concerning the promise.all and then clause below:*

When you write Promise.all([...]), you pass it an array of promises. Each promise was created by loadImage(). 
Remember what loadImage() does when it finishes:

img.onload = () => {
  resolve(img); // <-- resolves with the actual Image object
};

It resolves with img — the actual loaded Image object. That resolved value doesn't disappear. JavaScript collects it.
Promise.all waits for every promise in the array to resolve, then collects all the resolved values in the same order you listed them and packages them into a single array. 
That array gets passed into .then() as the first argument.

So the chain looks like this:
loadImage("tile_0001.png") → resolves with Image object → collected at index 0
loadImage("tile_0166.png") → resolves with Image object → collected at index 1
loadImage("tile_0039.png") → resolves with Image object → collected at index 2
loadImage("tile_0064.png") → resolves with Image object → collected at index 3
loadImage("tile_0000.png") → resolves with Image object → collected at index 4
                                                                    ↓
                                              Promise.all packages these into [img0, img1, img2, img3, img4]
                                                                    ↓
                                              .then((images) => ...) receives that array

So images in .then((images) => ...) isn't a special name — it's just the parameter name you give to whatever Promise.all hands you. 
You could call it results or loadedTiles or anything. images just makes it clear what it contains.
*/

Promise.all([
  loadImage("Images/tile_0001.png"), // grass
  loadImage("Images/tile_0166.png"), // road
  loadImage("Images/tile_0039.png"), // water
  loadImage("Images/tile_0064.png"), // building
  loadImage("Images/tile_0000.png"), // park
]).then((images) => {
  // images[0] is the loaded grass Image object
  // images[1] is the loaded road Image object
  // etc.

  TILE_IMAGES[TILE.GRASS] = images[0];
  TILE_IMAGES[TILE.ROAD] = images[1];
  TILE_IMAGES[TILE.WATER] = images[2];
  TILE_IMAGES[TILE.BUILDING] = images[3];
  TILE_IMAGES[TILE.PARK] = images[4];

  // NOW it's safe to render — images are ready
  render(); //render() is called inside Promise.all before it's defined in the file This looks like it should fail, but it works because of two JavaScript behaviors working together: function declarations are hoisted (the browser reads all function declarations before executing any code), and Promise.all resolves asynchronously (by the time it calls render(), the entire script has already finished loading).
});

/*
As concerning the TILE, path strings, and Image objects above: the path string is the string that lays out the actual file path to our images, 
the program uses these strings in tandem with things like Image objects to actually find the images and load them, 
the TILE key is the hashmap for mapping keyword identifiers with actual string values, so TILE.GRASS returns "grass," 
TILE.ROAD returns "road," etc., it's useful for later references in our programs for when we have to identify the tile types and don't want to make any typos or errors, 
the Image object is the object containing the actual loaded image resource that the canvas API knows how to draw
*/

// =====================
// WORLD STATE
// =====================

// 1. The world array (2D, WORLD_ROWS x WORLD_COLS)
//    Every cell starts as TILE.GRASS (not TILE.EMPTY like v1 —
//    a grass base makes more visual sense for a map builder)

// 2. selectedTile — default to TILE.GRASS

// 3. Camera variables (the five we discussed)

// 4. isPainting

// 5. hoveredCell

const world = []; // This variable is a 2D array that represents the grid of tiles in our world. Each element in the world array corresponds to a cell in the grid, and it stores the type of tile that is present in that cell (e.g., empty, road, building, park). The world array is initialized as an empty array, and then we use nested loops to fill it with rows and columns of TILE.GRASS values.

//world is filled horizontally running until it hits the amount of columns, and that process runs for however many rows there are 
for(let i = 0; i < WORLD_ROWS; i++){
  const rowArray = [];
  for(let j = 0; j < WORLD_COLS; j++){
    rowArray.push(TILE.GRASS);
  }
  world.push(rowArray);
}

let selectedTile = TILE.GRASS //whatever our selected tile is, this defaults to the grass tile. We should use "let" for our standard variable declaration (for when we expect our values to change) because if we use something like "const" then that tells the program that the value will never change. so "let" is better.

/*
You may be wondering:
some tiles aren't fully in view at any given point of the program, whether you're dragging the screen or simple just doing nothing, 
so some tiles you'll only see a portion of them like their corner sticking out at the edge of the screen, 
from this program, there are only precise and mathematical calculations, no part that actually handles partially displaying tiles,
so how can this be explained?

the code decides based on cameraX, cameraY, and all the other variables and blocks used for our 2D camera mechanics what and where the tiles should be displayed based on our given screen position, 
but the browser itself also plays a part, it clips any tiles that it can't fully display due to size constraints, that's the nature of the HTML5 Canvas API
and so that's how you can see tiles that are there but aren't fully in view even though the javascript itself doesn't have an exact feature to handle partially displaying tiles
*/

let cameraX = 0; // The total horizontal offset of the world from its origin. At startup this is 0, meaning the world starts at the left edge of the canvas. As the user drags left, this becomes negative; drag right, it becomes positive. Every tile's drawn X position is calculated relative to this value.
let cameraY = 0; // The total vertical offset of the world from its origin. At startup this is 0, meaning the world starts at the top edge of the canvas. As the user drags up, this becomes negative; drag down, it becomes positive. Every tile's drawn Y position is calculated relative to this value.
//So cameraX/Y is a constantly changing variable that depends on the position of map. So at the begininning of the program, it would have default coordinates.
//A good way to think about it: cameraX and cameraY answer one specific question that the render function asks every single frame: "Where should I draw the tile at world position (0, 0)?" Answer: at pixel (cameraX, cameraY) on the canvas.
let isDragging = false; // A boolean that tracks whether the user is currently holding the mouse button down and dragging. Flips to true on mousedown, back to false on mouseup. The mousemove handler checks this before doing anything — if it's false, mouse movement is ignored.
let dragStartX = 0; // // The X pixel position of the mouse at the moment the user pressed down. Updated at the start of every new drag. During mousemove, the difference between the current mouse X and this value tells us how far the mouse has moved horizontally since the drag began, which gets added to cameraX. The moment you start dragging, the moment the mouse was first pressed down, this variable gets set to that starting position, and resets when every time you start a new drag. After a drag, the new current mouse x position is subtracted by dragStartX and added to cameraX
let dragStartY = 0; // The Y pixel position of the mouse at the moment the user pressed down. Updated at the start of every new drag. During mousemove, the difference between the current mouse Y and this value tells us how far the mouse has moved vertically since the drag began, which gets added to cameraY. The moment you start dragging, the moment the mouse was first pressed down, this variable gets set to that starting position, and resets when every time you start a new drag. After a drag, the new current mouse y position is subtracted by dragStartY and added to cameraY

/*
"The moment you press the mouse down, dragStartX/Y captures your initial mouse position in pixels. 
As you drag, the system continuously tracks the mouse's movement frame-by-frame: 
it subtracts dragStartX/Y from the current mouse pixel position to calculate the exact distance shifted (the delta). 
It adds this delta directly to cameraX/Y to update the map's position, 
and then immediately updates dragStartX/Y to match the current mouse position to reset the baseline for the next frame. 
This constantly changing camera offset is then used by the rendering system to 
calculate exactly where to draw each image tile on the screen."
*/

/*
To understand the mouse's "pixel position," think of this:
(0,0) [Top-Left Corner]
  +-------------------------------------------------------------+
  |                                                             |
  |             *(250, 120)                                     |
  |             [Mouse is 250px from left, 120px from top]      |
  |                                                             |
  |                                                             |
  |                                                             |
  |                                         *(680, 410)         |
  |                                                             |
  +-------------------------------------------------------------+
                                                       (800, 600) [Bottom-Right Corner]

    Alright, now that we have our visualization, here is a written example of how dragging the mouse, pixel coordinates, and rendering all comes together:
    When you click down at that point (250, 120):
    - dragStartX is set to 250
    -dragStartY is set to 120
    If you nudge your mouse slightly to the right on the next frame to pixel 252, the system says you current x position
    is now 252. The system substracts the two (252 - 250 = 2), adds the 2 pixels to your cameraX, and your whole map slides
    by 2 pixels! 
    - It is all just pixels. There are no confusing unit conversions hidden under the hood. dragStartX / Y are pixels. cameraX / Y are pixels. The canvas size (800 x 600) is pixels. The TILE_SIZE (e.g., 50) is pixels. Because they all speak the exact same language, the math becomes incredibly clean. When you subtract dragStartX from your current mouse position, you get a value in pixels. You can then directly add those pixels straight to cameraX without translating a thing
    - So the whole dynamic with dragStartX/Y being subtracted from current mouse position is to tell us where on our map we're going through our dragging, and CameraX/Y tells us what we're supposed to see when we get there, although this is not one-step at a time printing out like a fax machine, it's a constantly updating system of functions and variables that makes the dragging experience seamless
*/

let isPainting = false; //boolean to let us know if we're painting or not

let hoveredCell = null; // Currently-hovered cell, or null if mouse isn't over the canvas, this variable is for tracking exactly where the mouse pointer if floating over the canvas matrix at any given milisecond, the rendering system uses this coordinate to draw that translucent preview box under your cursor before you actually click to paint

/**
 * Renders the visible portion of the game world (camera culling) 
 * and draws the hover preview element.
 */
function render() {
  // 1. CLEAR THE CANVAS
  // Prepares the canvas for a fresh frame by clearing previous drawings.
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 2. CALCULATE VISIBLE GRID BOUNDARIES (CULLING)
  // Computes the range of columns and rows currently inside the viewport.
  // This ensures we only draw what is on-screen, maximizing performance.

  // The leftmost visible column index, clamped to 0.
  const firstCol = Math.max(0, Math.floor(-cameraX / TILE_SIZE));
  
  // The rightmost visible column index, clamped to the rightmost edge of the map.
  const lastCol = Math.min(WORLD_COLS - 1, Math.floor((-cameraX + canvas.width) / TILE_SIZE));
  
  // The topmost visible row index, clamped to 0.
  const firstRow = Math.max(0, Math.floor(-cameraY / TILE_SIZE));
  
  // The bottommost visible row index, clamped to the bottommost edge of the map.
  const lastRow = Math.min(WORLD_ROWS - 1, Math.floor((-cameraY + canvas.height) / TILE_SIZE));

  // 3. RENDER VISIBLE TILES
  // Loops only through the visible rows and columns to draw the active tiles.
  for (let i = firstRow; i <= lastRow; i++) { 
    for (let j = firstCol; j <= lastCol; j++) {
      // Calculates the screen position for the current tile.
      //Basically: The tile at column j, row i should be drawn at horizontal pixel X and vertical pixel Y
      const pixelX = cameraX + (j * TILE_SIZE); 
      const pixelY = cameraY + (i * TILE_SIZE);

      // Retrieves the tile identifier and its associated pre-loaded image asset.
      const tileType = world[i][j]; //There is an actual 2d array containing the tile types for each cell in the grid, world, this is what we are extracting and referencing here
      const image = TILE_IMAGES[tileType];
      
      // Draw the tile on the screen context.
      // Basically, it says: "Give me an image, a location, and a size, and I will slap it onto the screen instantly."
      // In the parameters, it takes in an image, it takes in the Horizontal/Vertical pixel coordinates, as well as how big the image should be drawn, its width and height ("TILE_SIZE, TILE_SIZE" so 32x32), and given all those specifications, it draws the image in that location and in that size.
      ctx.drawImage(image, pixelX, pixelY, TILE_SIZE, TILE_SIZE);
    }
  }

  // 4. DRAW HOVER PREVIEW
  // Renders a semi-transparent preview of the selected tile on the hovered coordinate.
  if (hoveredCell !== null) {
    // Calculates screen coordinates for the hovered target grid space.
    // Say cameraX = 100 — meaning the user has dragged the map 100 pixels to the right. That means the hovered tile should appear 100 pixels further right on screen than its default position.
    const x = cameraX + (hoveredCell.col * TILE_SIZE);
    const y = cameraY + (hoveredCell.row * TILE_SIZE);
    
    // Set global opacity to 40% for the preview effect.
    ctx.globalAlpha = 0.4;
    
    // Draw the image of the selected tile at the hovered location.
    ctx.drawImage(TILE_IMAGES[selectedTile], x, y, TILE_SIZE, TILE_SIZE);
    
    // Reset global opacity back to 100% so subsequent rendering is unaffected.
    ctx.globalAlpha = 1.0;
  }
}

// =====================
// INTERACTION
// =====================

// 1. canvas mousedown
//    - if right-click or middle-click: start dragging
//    - if left-click: start painting
//    (we need to separate drag from paint by mouse button)

// 2. canvas mousemove
//    - if dragging: update camera, re-render
//    - if painting: paint tile at current cell, re-render
//    - always: update hoveredCell, re-render

// 3. canvas mouseup
//    - stop dragging and painting

// 4. canvas mouseleave
//    - stop dragging, painting, clear hoveredCell

// 5. A helper function: screenToWorld(event)
//    - converts mouse pixel position to world grid coordinates
//    - returns { row, col } or null if outside world bounds


canvas.addEventListener("mousedown", (event) => {
  if (event.button === 2 || event.button === 1) {
    // right or middle click → drag
    isDragging = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
  } else if (event.button === 0) {
    // left click → paint
    isPainting = true;
    paintTile(screenToWorld(event)); // we'll write paintTile next
  }
});

canvas.addEventListener("mousemove", (event) => {
  // always update hovered cell
  hoveredCell = screenToWorld(event);

  if (isDragging) {
    const deltaX = event.clientX - dragStartX;
    const deltaY = event.clientY - dragStartY;
    cameraX += deltaX;
    cameraY += deltaY;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
  } else if (isPainting) {
    paintTile(hoveredCell);
  }

  cameraX = Math.min(0, Math.max(canvas.width - (WORLD_COLS * TILE_SIZE) , cameraX)); //clamp cameraX to prevent panning beyond world bounds
  cameraY = Math.min(0, Math.max(canvas.height - (WORLD_ROWS * TILE_SIZE) , cameraY)); //Same as above but for cameraY

  render();
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
  isPainting = false;
});

canvas.addEventListener("mouseleave", () => {
  isDragging = false;
  isPainting = false;
  hoveredCell = null;
  render();
});

canvas.addEventListener("contextmenu", (event) => { //By default, right-clicking opens the browser's context menu, which would interrupt dragging So we need to prevent it
  event.preventDefault();
});

/**
 * Converts screen/mouse pixel coordinates into world grid coordinates (col, row).
 * Returns an object with { col, row } if inside world bounds, or null if outside.
 */
function screenToWorld(event) {
  // 1. Get the physical position and boundaries of the canvas element on the webpage
  const rect = canvas.getBoundingClientRect();

  // 2. Calculate the mouse's X and Y coordinates relative to the top-left corner of the canvas
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  // 3. Reverse-engineer the camera rendering math:
  //    Subtract the camera offset from the mouse position to get the world pixel position,
  //    then divide by TILE_SIZE and round down using Math.floor to get the exact grid index.
  const col = Math.floor((mouseX - cameraX) / TILE_SIZE);
  const row = Math.floor((mouseY - cameraY) / TILE_SIZE);

  // 4. Boundary Check (Guardrail):
  //    If the calculated grid coordinate falls outside the boundaries of our actual map
  //    (less than 0 or greater than the maximum columns/rows), return null.
  if (col < 0 || col >= WORLD_COLS || row < 0 || row >= WORLD_ROWS) {
    return null; 
  }

  // 5. Return the calculated grid coordinates
  return { col: col, row: row };
}

function paintTile(cell) {
  // if cell is null, do nothing
  // otherwise, write selectedTile into world[cell.row][cell.col]

  if (cell === null) {
    return; // If the cell is null (meaning the mouse is outside the world bounds), we simply exit the function without making any changes.
  }
  world[cell.row][cell.col] = selectedTile; // If the cell is valid, we update the world array at the specified row and column to the currently selected tile type. This effectively "paints" the tile in the world grid.
  render();
}

// =====================
// TOOLBAR
// =====================

// 1. Get all tile buttons (hint: querySelectorAll with the right selector)

// 2. For each button, add a click listener that:
//    - reads the data-tile attribute
//    - updates selectedTile
//    - removes "active" class from all buttons
//    - adds "active" class to the clicked button

const toolbarButtons = document.querySelectorAll("#toolbar button[data-tile]"); 

toolbarButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedTile = button.dataset.tile;
    toolbarButtons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
  });
});

// =====================
// SAVE / LOAD / CLEAR
// =====================

document.getElementById("save-btn").addEventListener("click", () => {
  // 1. Convert world to JSON string
  // 2. Create a Blob (a file-like object) from that string
  // 3. Create a temporary download link and click it

  const jsonString = JSON.stringify(world); // Convert the world array into a JSON string representation. This allows us to save the current state of the world in a format that can be easily stored and later restored.
  const blob = new Blob([jsonString], { type: "application/json" }); // Create a new Blob object containing the JSON string. A Blob is a file-like object of immutable, raw data. Here, we specify the MIME type as "application/json" to indicate that the content is JSON data.
  const url = URL.createObjectURL(blob); // Generate a temporary URL that points to the Blob object. This URL can be used to download the Blob as a file.
  const a = document.createElement("a"); // Create a new anchor (<a>) element. This element will be used to trigger the download of the Blob when clicked.
  a.href = url; // Set the href attribute of the anchor element to the Blob URL. This makes the anchor a download link for the Blob.
  a.download = "map.json"; // Set the download attribute of the anchor element to specify the default filename for the downloaded file. In this case, it will be "map.json".
  a.click(); // Programmatically click the anchor element. This simulates a user clicking the link, which triggers the download of the Blob as a file. 
  URL.revokeObjectURL(url); // Clean up by revoking the temporary Blob URL. This frees up memory and resources associated with the Blob URL, as it is no longer needed after the download has been initiated.
});

document.getElementById("load-btn").addEventListener("click", () => {
  // 1. Create a hidden file input element and click it
  //    (this opens the file picker dialog)
  // 2. When the user selects a file, read it with FileReader
  // 3. When FileReader finishes, parse the JSON
  // 4. Replace world contents cell by cell
  // 5. Re-render

const input = document.createElement("input"); // Create a new input element of type "file". This input will be used to allow the user to select a file from their local filesystem.
input.type = "file"; // Set the type of the input element to "file". This tells the browser that this input is for file selection, which will open a file picker dialog when clicked.
input.accept = ".json"; // Restrict the file types that can be selected to only JSON files. This is done by setting the accept attribute to ".json", which filters the file picker dialog to show only files with a .json extension.
input.click(); // Programmatically click the input element. This simulates a user clicking the file input, which opens the file picker dialog for the user to select a file.

input.addEventListener("change", () => { // Add an event listener for the "change" event on the input element. This event fires when the user selects a file and the input's value changes.
  const file = input.files[0]; // Get the first file selected by the user. The input.files property is a FileList object that contains all the files selected by the user. We access the first file using index 0.
  const reader = new FileReader(); // Create a new FileReader object. The FileReader API allows us to read the contents of files selected by the user. It provides methods to read files as text, data URLs, or binary data.
  reader.onload = (e) => { // Set up an event handler for the "load" event of the FileReader. This event fires when the file has been successfully read. The event object (e) contains the result of the read operation.
    const loaded = JSON.parse(e.target.result); // Parse the JSON string read from the file into a JavaScript object. The e.target.result property contains the contents of the file as a string. We use JSON.parse to convert this string back into a JavaScript array (the world state).
    // replace world contents here
for (let i = 0; i < WORLD_ROWS; i++) {
  for (let j = 0; j < WORLD_COLS; j++) {
    world[i][j] = loaded[i][j];
  }
}
render();
  };
  reader.readAsText(file);
});
});

document.getElementById("clear-btn").addEventListener("click", () => {
// loop through world and reset every cell to TILE.GRASS
// then re-render
for (let i = 0; i < WORLD_ROWS; i++) {
  for (let j = 0; j < WORLD_COLS; j++) {
    world[i][j] = TILE.GRASS;
  }
}
  cameraX = 0;
  cameraY = 0;
  render();
});

// =====================
// PATHFINDING CONFIG
// =====================

// In JavaScript, two distinct objects containing the exact same data (e.g., {row: 5, col: 2} and {row: 5, col: 2}) are considered not equal by standard comparisons or data sets, so, the solution is: it flattens coordinate structures into unique strings like "5,2". This allows your tracking collections (Set and Map) to reliably compare and store cell states without object-reference bugs.
// So, we have this template literal, if you do know, then a template literal is way of making strings so that we do not have to do concatentaiton, so before, we would do something like ' ("Hello world my age" + age int variable) ', but with template literals, we have our notations of '`' backticks and '${},' so that we can now do (`Hello, my name is ${name} and I am ${age} years old.`) and integrate the non-print statement variables seamlessly.
//So what we do here with this function, is basically we just return a string corresponding to the row and column number of the cell parameter passed through, so "const cell = { row: 5, col: 12 };" Passing it through this template literal turns it into a plain text string: "5,12"
function cellKey(cell) { 
  return `${cell.row},${cell.col}`;
}

// Get the up-to-4 orthogonal neighbors of a cell, clipped to the grid bounds, if it's out of bounds, we don't count it
function neighbors(cell) {
  const result = [];
  //This variable is an array of integer pairs, it represents the row & column of surrounding "neighbor" cells, so for example, north's coordinates, { dr: -1, dc:  0 } is like that because north is one row ABOVE, ie, the previous row, the current cell, and the same logic with the rest of the integer pairs
  //dr stands for Delta Row (Change in Row) and dc stands for Delta Column (Change in Column)
  const directions = [
    { dr: -1, dc:  0 }, // north
    { dr:  1, dc:  0 }, // south
    { dr:  0, dc: -1 }, // west
    { dr:  0, dc:  1 }, // east
  ];

  //Loop through all the four cardinal directions defined in the directions[] array
  for (const { dr, dc } of directions) {
    // This is how we get our adjacent neighbor cells coordinates, we apply the Delta Row (dr) and Delta Column (dc) variables to the current cell's row/column position to calculate the exact coordinate of the adjacent neighbor.
    const newRow = cell.row + dr;
    const newCol = cell.col + dc;
    //If any of our adjacent neighbors fall outside the index boundaries (< 0; or exceeding total rows/columns as defined by our global ROWS and COLS constants) then we execute 'continue,' which tells the loop to immediately drop everything, discard this invalid coordinate, and skip directly to the next direction in the array.
    if (newRow < 0 || newRow >= WORLD_ROWS || newCol < 0 || newCol >= WORLD_COLS) {
      continue;
    }
    // 'row: newRow, col: newCol' are variable declarations, the variables are being set to the neighbor cells coordinates (newRow, newCol), and we use .push() to append it to our collection array
    result.push({ row: newRow, col: newCol });
  }
  //return our result array, i.e., the coordinates to our neighboring cells
  return result;
}

const TILE_COSTS = {
  // fill in each tile type and its movement cost
  grass: 1,
  road: 1,
  water: Infinity, // Impassable
  building: Infinity, // Impassable
  park: 2
};

function isImpassable(tileType) { //Returns true if the tile is impassable, false otherwise
  return TILE_COSTS[tileType] === Infinity;
}

function bfs(start, end) {

  if (!start || !end) { //Check for null or undefined start or end nodes
    return { path: null, explored: [], nodesExplored: 0 };
  }

  // 1. Check if start or end is impassable → return null result
  // 2. Set up queue, visited set, cameFrom map, explored array
  // 3. BFS loop — record each dequeued cell into explored
  // 4. If end found, return { path, explored, nodesExplored }
  // 5. If queue empties, return { path: null, explored, nodesExplored }
const explored = []; //Array to keep track of all cells that have been explored during the BFS search

    if (isImpassable(world[start.row][start.col]) || isImpassable(world[end.row][end.col])) {
    return { path: null, explored: [], nodesExplored: 0 };
  } 

   //how many nodes we explored
  let nodesExplored = 0;

  const queue = [start]; // BFS relies on a queue data structure, which, as you know, follows a First-In, First-Out (FIFO) strategy, we start with putting our initial starting cell
  const visited = new Set(); //A Set() is an object in javascript that is similar to an array in the sense that it's used to store multiple values, however, the difference with a Set is that the values of the Set are a collection of unique values, meaning you cannot have duplicate values or objects inside the Set, so if I add two values to the Set, and then try and add the first value to the Set again, that Set's length will still remain 2
  visited.add(cellKey(start)); //Set the Visited Set()'s first value as our starting cell's string coordinates
  const cameFrom = new Map(); // A Map() is a collection of key-value pairs, similar to an object in JavaScript, but with some differences. In a Map, keys can be of any type (not just strings or symbols), and they maintain the order of insertion. In this case, cameFrom will be used to keep track of the parent cells for each cell that is explored during the BFS. The key will be the string representation of a cell's coordinates (from cellKey), and the value will be the cell object that led to it. This allows us to reconstruct the path once we reach the end cell. 

  while (queue.length > 0) { //As long as there are cells waiting in line, the loop keeps running
    const current = queue.shift(); //shift() removes the first element from an array and returns that removed element. This method modifies (mutates) the original array by shifting all subsequent elements one position to the left 
    nodesExplored++; //Increment the number of nodes explored by 1, so we can keep track of how many cells we explored in our search for a path
    explored.push(current); //Add the current cell to the explored array to keep track of all cells that have been visited during the BFS search
    //If we've reach the end cell, we log the number of nodes explored and call reconstructPath() to build the path from start to end using the cameFrom map. The function returns the reconstructed path as an array of cells. 
    if (current.row === end.row && current.col === end.col) {
      console.log(`BFS explored ${nodesExplored} nodes`);
      const path = reconstructPath(cameFrom, end);
      return { path, explored, nodesExplored };
    }

    // The code loops through the up-to-4 adjacent cells provided by the neighbors() function 
    for (const next of neighbors(current)) {
      const key = cellKey(next); //We convert the next cell's coordinates into a unique string key using cellKey(next). This key will be used to check if the cell has already been visited and to store its parent in the cameFrom map.
      if (isImpassable(world[next.row][next.col])) continue; //If next cell is impassible, we skip it and continue to the next neighbor
      if (visited.has(key)) continue; //If the next cell has already been visited (i.e., its key is in the visited set), we skip it and continue to the next neighbor. This prevents us from revisiting cells and getting stuck in loops.
      visited.add(key); //If the next cell is valid and unvisited, we mark it as visited by adding its key to the visited set. This ensures that we won't process this cell again in future iterations of the BFS.
      cameFrom.set(key, current); //key is the cell we are currently exploring, and current is the cell we just came from. This line records that we reached the next cell from the current cell, allowing us to trace back the path later. The key is "key" and the value is "current".
      queue.push(next); //Push the next cell onto the queue, so it will be processed in future iterations of the BFS. This is how we expand our search outward from the starting point, exploring all reachable cells in a breadth-first manner.
    }
  }
  // When we do this initial line, "const current = queue.shift()," it returns the first element, the start cell, and removes it from the queue. Then, we check if that cell is the end cell. If it is not, we explore its neighbors and add them to the queue. This process continues until we either find the end cell or exhaust all possible cells to explore. If we exit the while loop without finding the end cell, it means there is no valid path from start to end.

  console.log(`BFS explored ${nodesExplored} nodes (no path)`); //Failure message, if we exit the while loop without finding the end cell, it means there is no valid path from start to end. We log the number of nodes explored and indicate that no path was found. The function then returns null to signify that no path exists.
  return { path: null, explored, nodesExplored };
}

function dijkstra(start, end) {
  if (isImpassable(world[start.row][start.col]) || 
      isImpassable(world[end.row][end.col])) {
    return { path: null, explored: [], nodesExplored: 0 };
  }

  const dist = new Map();
  const cameFrom = new Map();
  const explored = [];
  let nodesExplored = 0;

  const openSet = [{ cell: start, cost: 0 }];
  dist.set(cellKey(start), 0);

  while (openSet.length > 0) {
    let bestIndex = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].cost < openSet[bestIndex].cost) {
        bestIndex = i;
      }
    }
    const removedItem = openSet.splice(bestIndex, 1)[0];
    const current = removedItem.cell;
    
    const currentKey = cellKey(current);

    explored.push(current);
    nodesExplored++;

    if (current.row === end.row && current.col === end.col) {
      const path = reconstructPath(cameFrom, end);
      return { path, explored, nodesExplored };
    }

    for (const next of neighbors(current)) {
      if (isImpassable(world[next.row][next.col])) continue;
      const nextKey = cellKey(next);
      const tentativeCost = dist.get(currentKey) + 
                            TILE_COSTS[world[next.row][next.col]];

      // Relaxation step: ONLY update maps and queue if path is cheaper
      if (!dist.has(nextKey) || tentativeCost < dist.get(nextKey)) {
        dist.set(nextKey, tentativeCost);
        cameFrom.set(nextKey, current);

        const existingIndex = openSet.findIndex(item => cellKey(item.cell) === nextKey);
        if (existingIndex !== -1) {
          openSet[existingIndex].cost = tentativeCost;
        } else {
          openSet.push({ cell: next, cost: tentativeCost });
        }
      }
    }
  }

  return { path: null, explored, nodesExplored };
}