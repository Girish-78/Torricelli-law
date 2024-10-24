 let orifices = [];
let waterLevelSlider;
let containerHeight = 300;
let containerRadius = 50;
let groundY;
let g = 9.8; // gravitational acceleration
let waterLevel = 0;
let buttonX = 20; // button position
let buttonY = 40; // starting y position for buttons
let orificeRadius = 5;

function setup() {
  createCanvas(800, 400);
  groundY = height - 50;
  
  // Slider for water level
  waterLevelSlider = createSlider(0, containerHeight, containerHeight / 2);
  waterLevelSlider.position(buttonX, buttonY);
  
  // Label for water level slider
  createP('Water Level (Height from orifice in meters)').position(buttonX, buttonY - 30);
  
  textFont('Georgia'); // Clear font for labels and values
}

function draw() {
  background(220);
  drawContainer();
  drawGround();
  updateWaterLevel();
  
  // Draw all orifices and calculate efflux for each
  orifices.forEach(orifice => {
    drawOrifice(orifice);
    let efflux = calculateEfflux(orifice.y);
    drawTrajectory(orifice.x, orifice.y, efflux);
    displayEffluxValues(orifice.x, orifice.y, efflux);
  });
  
  // Display water level
  fill(0);
  textSize(16);
  text(`Water Level: ${(containerHeight - waterLevel).toFixed(2)} meters`, width / 2, 50);
  
  // Show formulas on the left in bold font
  textSize(14);
  textStyle(BOLD);
  text(`Velocity (v) = sqrt(2gh)`, buttonX, buttonY + 100);
  text(`Range (R) = v * sqrt(2h/g)`, buttonX, buttonY + 140);
  textStyle(NORMAL);
}

function drawContainer() {
  // Draw the cylindrical container
  fill(150, 200, 250);
  rect(width / 2 - containerRadius, groundY - containerHeight, 2 * containerRadius, containerHeight);
  
  // Draw the water inside the container
  fill(0, 0, 255, 150);
  rect(width / 2 - containerRadius, groundY - containerHeight + waterLevel, 2 * containerRadius, containerHeight - waterLevel);
}

function drawGround() {
  // Draw the ground line
  stroke(0);
  line(0, groundY, width, groundY);
}

function drawOrifice(orifice) {
  // Draw an orifice
  fill(255, 0, 0);
  ellipse(orifice.x, orifice.y, orificeRadius * 2, orificeRadius * 2);
}

function mousePressed() {
  // Create orifice only on the left or right walls below the water level
  if (mouseY > groundY - containerHeight + waterLevel && mouseY < groundY) {
    if (mouseX > width / 2 - containerRadius - orificeRadius && mouseX < width / 2 - containerRadius + orificeRadius) {
      // Left wall
      orifices.push({x: width / 2 - containerRadius, y: mouseY});
    } else if (mouseX > width / 2 + containerRadius - orificeRadius && mouseX < width / 2 + containerRadius + orificeRadius) {
      // Right wall
      orifices.push({x: width / 2 + containerRadius, y: mouseY});
    }
  }
}

function updateWaterLevel() {
  waterLevel = containerHeight - waterLevelSlider.value();
}

function calculateEfflux(orificeY) {
  // h is the depth from the free surface of the water to the orifice
  let h = orificeY - (groundY - containerHeight + waterLevel); // Depth below water surface
  
  // If the orifice is below the free surface, calculate the velocity
  let velocity = h > 0 ? sqrt(2 * g * h) : 0; // Torricelli's law for velocity, only if h > 0
  return velocity;
}

function drawTrajectory(orificeX, orificeY, velocity) {
  // Draw the natural trajectory of water as a projectile
  stroke(0, 0, 255);
  noFill();
  
  // Parabolic motion of water
  let time = 0;
  let dt = 0.1; // Time increment for trajectory plotting
  let vx = (orificeX < width / 2) ? -velocity : velocity; // Horizontal velocity component: left or right
  let vy = 0; // Initial vertical velocity is 0
  
  beginShape();
  for (let t = 0; t < 5; t += dt) {
    let x = orificeX + vx * t; // Horizontal position
    let y = orificeY + vy * t + 0.5 * g * t * t; // Vertical position using y = y0 + vt + 1/2gt^2
    
    // Stop drawing the trajectory when it hits the ground
    if (y >= groundY) break;
    
    vertex(x, y);
  }
  endShape();
}

function displayEffluxValues(x, y, velocity) {
  let range = calculateRange(velocity);
  
  fill(0);
  noStroke();
  textSize(12);
  
  // Adjust value display position based on whether the orifice is on the left or right
  if (x < width / 2) {
    text(`v = ${velocity.toFixed(2)} m/s`, x - 60, y - 10);
    text(`R = ${range.toFixed(2)} m`, x - 60, y + 10);
  } else {
    text(`v = ${velocity.toFixed(2)} m/s`, x + 10, y - 10);
    text(`R = ${range.toFixed(2)} m`, x + 10, y + 10);
  }
}

function calculateRange(velocity) {
  // Range is calculated as v * sqrt(2h/g)
  let h = (groundY - waterLevel); // Effective height of water in the container
  return velocity * sqrt(2 * h / g);
}
