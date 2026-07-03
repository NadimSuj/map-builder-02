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

canvas.addEventListener("mousedown", (event) => {
  //Something like:
  // isDragging = true
  // dragStartX = event.clientX
  // dragStartY = event.clientY

  // the browser gives you the current mouse position via event.clientX and event.clientY inside any mouse event handler.
  isDragging = true
  dragStartX = event.clientX
  dragStartY = event.clientY
  // render(); in mousedown — you don't actually need this. Pressing the mouse down doesn't change anything visible, so there's nothing to redraw
});

canvas.addEventListener("mousemove", (event) => {
  // Something like:
  //if (isDragging) {
  // calculate the delta (between current mouse and dragStartX/Y)
  // Update CameraX/Y
  // Update dragStartX/Y
  // Render the updated scene


  //the browser gives you the current mouse position via event.clientX and event.clientY inside any mouse event handler.
  if (isDragging) { 
    const deltaX = event.clientX - dragStartX  //We put them (deltaX/Y) as const because they are not going to change within this block, they're calculated once and never reassigned or modified
    const deltaY = event.clientY - dragStartY
    cameraX = cameraX + deltaX 
    cameraY = cameraY + deltaY 
    dragStartX = event.clientX 
    dragStartY = event.clientY 
    render(); //*This doesnt exist yet
  }
});

canvas.addEventListener("mouseup", (event) => {
  // Something like:
  // isDragging = false
  isDragging = false
});

