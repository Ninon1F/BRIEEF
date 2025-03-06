let isDay = true;
let stars = [];
let shootingStars = [];
let fadeSpeeds = [];
let timeOffsets = [];
let moonTexture, sunTexture, cloudImg, rocketImg, ufoImg, cowImg, birdImg, planeImg;
let rayThicknesses = [];
let dayTime = 0;
let clouds = [];
let birds = [];
let daySound, nightSound, clickSound, wooshSound, ufosound, planesound; // Added plane sound variable
let rocket = null;
let rocketLaunched = false;
let rocketSpeed = 4; // Slower rocket speed

let ufo, cow;
let ufoAppeared = false;
let planeX = -150; // Starting position of the plane
let planeY = 100; // Initial vertical position of the plane
let planeSpeed = 5; // Slower plane speed
let planePassed = false; // Flag to ensure the plane only moves once

function preload() {
  moonTexture = loadImage('moon.png');
  sunTexture = loadImage('sun.png');
  cloudImg = loadImage('cloud.png');
  rocketImg = loadImage('rocket.png');
  ufoImg = loadImage('ufo.png'); // UFO image
  cowImg = loadImage('cow.png'); // Cow image
  birdImg = loadImage('bird.png'); // Bird image
  planeImg = loadImage('plane.png'); // Plane image
  daySound = loadSound('day.mp3');
  nightSound = loadSound('night.mp3');
  clickSound = loadSound('click.mp3');
  wooshSound = loadSound('woosh.mp3');
  ufosound = loadSound('ufosound.mp3'); // UFO sound
  planesound = loadSound('planesound.mp3'); // Plane sound
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0, 150, 255);
  drawDay();

  let changeBgBtn = createButton("Night");
  changeBgBtn.addClass("myButton");

  setTimeout(() => {
    let w = changeBgBtn.elt.offsetWidth;
    let h = changeBgBtn.elt.offsetHeight;
    changeBgBtn.position(windowWidth / 2 - w / 2, windowHeight / 2 - h / 2);
  }, 0);

  changeBgBtn.mousePressed(() => {
    clickSound.play();
    changeBackground();

    if (isDay) {
      changeBgBtn.style("background-color", "black");
      changeBgBtn.html("Night");
    } else {
      changeBgBtn.style("background-color", "#6EC6FF");
      changeBgBtn.html("Day");
    }
  });

  changeBgBtn.mouseOver(() => {
    changeBgBtn.style("box-shadow", "0px 0px 15px 5px rgba(255, 255, 255, 0.7)");
  });

  changeBgBtn.mouseOut(() => {
    changeBgBtn.style("box-shadow", "none");
  });

  createClouds();
  createBirds(); // Create birds
}

function draw() {
  if (!isDay) {
    drawNight();
    moveUFOAndSwoopCow(); // Only move the UFO and cow during night
  } else {
    drawDay();
    drawClouds();
    moveBirds(); // Move birds during the day only
    if (!planePassed) {
      drawPlane(); // Draw plane during the day only once
    }
  }

  if (rocketLaunched) {
    drawRocket();
  }
}

function drawDay() {
  dayTime += 0.03;
  let topColor = color(0, 150 + 50 * sin(dayTime), 255);
  let bottomColor = color(135, 206, 235);

  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let skyColor = lerpColor(topColor, bottomColor, inter);
    stroke(skyColor);
    line(0, y, width, y);
  }

  drawSunRays();
  image(sunTexture, -width / 2, -height / 2, width, height);
  noTint();
}

function drawSunRays() {
  let rotationSpeed = 0.005;
  let rotationAngle = frameCount * rotationSpeed;

  if (rayThicknesses.length === 0) {
    for (let i = 0; i < 3; i++) {
      rayThicknesses.push(random(10, 70 - i * 10));
    }
  }

  for (let i = 0; i < rayThicknesses.length; i++) {
    strokeWeight(rayThicknesses[i]);
    stroke(255, 255, 102, 150 - i * 50);

    for (let angle = 0; angle < TWO_PI; angle += PI / 12) {
      let x1 = 0;
      let y1 = 0;
      let x2 = cos(angle + rotationAngle) * width * 1.5;
      let y2 = sin(angle + rotationAngle) * height * 1.5;
      line(x1, y1, x2, y2);
    }
  }
}

function drawNight() {
  let topColor = color(0, 0, 0); // Black
  let bottomColor = color(25, 25, 112); // Dark blue

  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let skyColor = lerpColor(topColor, bottomColor, inter);
    stroke(skyColor);
    line(0, y, width, y);
  }

  if (stars.length === 0) {
    for (let i = 0; i < 300; i++) {
      stars.push({ x: random(width), y: random(height), size: random(2, 6) });
      fadeSpeeds.push(random(0.03, 0.05));
      timeOffsets.push(random(TWO_PI));
    }
  }

  for (let i = 0; i < stars.length; i++) {
    let star = stars[i];
    let fadeAmount = map(sin(frameCount * fadeSpeeds[i] + timeOffsets[i]), -1, 1, 50, 255);
    fill(255, fadeAmount);
    noStroke();
    ellipse(star.x, star.y, star.size);
  }

  drawMoon();
  drawShootingStars();

  if (!ufoAppeared) {
    cow = { x: random(width), y: height - 100, size: 100, alpha: 255 };
    spawnUFOAndSwoopCow();
  }
}

function drawMoon() {
  push();
  translate(width - 150, 150);
  rotate(radians(sin(frameCount * 0.02) * 10));
  image(moonTexture, -165, -165, 330, 330);
  pop();
}

function drawShootingStars() {
  if (frameCount % 150 === 0) {
    shootingStars.push({ x: random(width), y: random(height), length: random(30, 70), alpha: 255 });
  }

  for (let i = shootingStars.length - 1; i >= 0; i--) {
    let shootingStar = shootingStars[i];
    shootingStar.x += 5;
    shootingStar.y += random(-1, 1);
    shootingStar.alpha -= 5;

    stroke(0, 0, 255, shootingStar.alpha);
    strokeWeight(6);
    line(shootingStar.x - shootingStar.length * 0.5, shootingStar.y, shootingStar.x - shootingStar.length, shootingStar.y);

    stroke(255, shootingStar.alpha);
    strokeWeight(2);
    line(shootingStar.x, shootingStar.y, shootingStar.x - shootingStar.length, shootingStar.y);

    if (shootingStar.alpha <= 0) {
      shootingStars.splice(i, 1);
    }
  }
}

function changeBackground() {
  isDay = !isDay;

  if (isDay) {
    stars = [];
    fadeSpeeds = [];
    timeOffsets = [];
    rayThicknesses = [];
    drawDay();

    if (!daySound.isPlaying()) {
      daySound.play();
    }
    nightSound.stop();

    rocketLaunched = false;
    rocket = null;
    wooshSound.stop();

    ufoAppeared = false;
    ufosound.stop(); // Stop UFO sound if it's playing
    planePassed = false; // Reset the plane flag when switching to day
    resetPlanePosition(); // Reset the plane's position to the starting point
  } else {
    drawNight();

    if (!nightSound.isPlaying()) {
      nightSound.play();
    }
    daySound.stop();

    setTimeout(() => {
      if (!isDay) {
        rocketLaunched = true;
        rocket = { x: random(50, width - 50), y: height, size: 250, speed: rocketSpeed, alpha: 255 };
      }
    }, 2000);
  }

  createClouds();
}

function createClouds() {
  clouds = [];
  for (let i = 0; i < 15; i++) {
    clouds.push({ x: random(-200, width + 200), y: random(-200, height + 200), size: random(300, 800), speed: random(0.1, 0.4) });
  }
}

function createBirds() {
  birds = [];
  for (let i = 0; i < 10; i++) {
    birds.push({
      x: random(width),
      y: random(height),
      size: random(30, 60),
      speed: random(1, 3),
      direction: random() > 0.5 ? 1 : -1
    });
  }
}

function moveBirds() {
  for (let bird of birds) {
    bird.x += bird.speed * bird.direction;

    // Reset bird position when they reach the edge, but they will continue in the same direction.
    if (bird.x > width + bird.size || bird.x < -bird.size) {
      bird.x = bird.direction === 1 ? -bird.size : width + bird.size; // Reset to the opposite side
    }

    image(birdImg, bird.x, bird.y, bird.size, bird.size);
  }
}

function drawPlane() {
  if (planeX < width) {
    planeX += planeSpeed; // Slower plane speed

    // Play the plane sound as soon as the plane starts drawing, not after it fully enters the screen
    if (!planesound.isPlaying()) {
      planesound.play();
    }
  } else {
    // Stop plane sound when the plane leaves the screen
    if (planesound.isPlaying()) {
      planesound.stop();
    }
    planePassed = true; // Mark that the plane has passed once
  }

  // Make the plane bigger by adjusting its size
  let planeWidth = 350;
  let planeHeight = planeImg.height / planeImg.width * planeWidth;

  image(planeImg, planeX, planeY, planeWidth, planeHeight); // Draw the plane with the new size
}

function resetPlanePosition() {
  planeX = -random(150, 500); // Plane starts from random positions on the left
  planeY = random(100, height / 2); // Random vertical position
}

function drawClouds() {
  for (let i = 0; i < clouds.length; i++) {
    let cloud = clouds[i];
    image(cloudImg, cloud.x, cloud.y, cloud.size, cloud.size / 1.5);
    cloud.x += cloud.speed;

    if (cloud.x > width + 200) {
      cloud.x = -cloud.size;
    }
  }
}

function drawRocket() {
  rocket.y -= rocket.speed;

  if (frameCount % 10 === 0 && rocket.y >= 0) {
    wooshSound.setVolume(0.1,5); 
    wooshSound.play();
  }

  push();
  translate(rocket.x, rocket.y);
  image(rocketImg, -rocket.size / 2, -rocket.size / 2, rocket.size, rocket.size);
  pop();

  if (rocket.y < 0) {
    rocketLaunched = false;
    rocket = null;
    wooshSound.stop(); 
  }
}

function spawnUFOAndSwoopCow() {
  let randomX = random(width); 
  ufo = { x: randomX, y: -100, speed: 2 }; 
  cow = { x: randomX, y: height - 100, size: 100, alpha: 255 }; 
  ufoAppeared = true; 
  ufosound.play(); // Play UFO sound when the UFO appears
}

function moveUFOAndSwoopCow() {
  if (ufo && cow) {  
    if (ufo.y < height / 2 - 100) {
      ufo.y += ufo.speed;
    } else {
      if (cow.y > ufo.y + 50) {
        cow.y -= 3; 
      } else {
        cow = null;  
        ufo = null;  
        ufosound.stop(); // Stop UFO sound when the UFO disappears
      }
    }

    if (ufo) {
      image(ufoImg, ufo.x - 100, ufo.y - 100, 200, 200);
    }
    if (cow) {
      image(cowImg, cow.x - cow.size / 2, cow.y - cow.size / 2, cow.size, cow.size);
    }

    // Draw the triangular light beam
    if (ufo && ufo.y > 0 && ufo.y < height) {
      let beamLength = 1000;  // Increased beam length
      let beamThickness = 500;  // Increased thickness for the beam
      let ufoCenterX = ufo.x; 
      let ufoCenterY = ufo.y; 

      noStroke();
      fill(255, 255, 0, 100); // Light beam fill

      beginShape();
      vertex(ufoCenterX, ufoCenterY); 
      vertex(ufoCenterX - beamThickness / 2, ufoCenterY + beamLength); 
      vertex(ufoCenterX + beamThickness / 2, ufoCenterY + beamLength); 
      endShape(CLOSE);
    }
  }
}
