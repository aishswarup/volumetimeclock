new p5();

var countDivisor = 3;
var secondsParticleRadius = 30;
var remaining_colors = ['#F0E400', '#E84063', '#EC6C28', '#F9B40A', '#E26FA7', '#E74335'];
var passed_colors = ['#383C8F', '#058CAD', '#614A98', '#31276A', '#272F67'];
var remaining_center = createVector(windowWidth/5, 300);
var passed_center = createVector(windowWidth * 4/5, 300);

var secondsColor = ['#EC6C28', '#EA8428', '#E89B29', '#E5CF28', '#C4D339', '#86BD41', '#6AB547', '#50AB64', '#4FB0A5', '#4D85AF', '#4D4F9C'];

var radiusGenerator = d3.randomUniform(15, 30);
var positionRandomizer = d3.randomBates(4);

var getRandomColor = function(colors) {
  var selected = colors[Math.floor(Math.random() * colors.length)];
  return color(red(selected), green(selected), blue(selected), 180);
}

var getRandomInRange = function(randomizer, min, max) {
  return min + ((max - min) * randomizer());
}

var getRandomCoords = function(origin, count) {
  var range = count / countDivisor;
  return function() {
    return createVector(
      getRandomInRange(positionRandomizer, origin.x - range, origin.x + range),
      getRandomInRange(positionRandomizer, origin.y - range, origin.y + range)
    )
  };
}

var getSecondsParticleColor = function(timeStep) {
  var index = (secondsColor.length - 1) * min(timeStep, 0.99);
  return lerpColor(color(secondsColor[Math.floor(index)]), color(secondsColor[Math.floor(index)+1]), index - Math.floor(index));
  // return secondsColor[Math.floor(index)];
}

var Particle = function(position, color, radius) {
  this.position = position;
  this.color = color;
  this.radius = radius;

  this.render = function() {
    fill(this.color);
    ellipse(this.position.x, this.position.y, this.radius);
  }
}

var ParticleSystem = function(position, count, colors) {
  this.origin = position;
  this.particles = [];
  this.colors = colors;
  this.count = count;

  this.setup = function() {
    this.coordinateGenerator = getRandomCoords(this.origin, this.count);
    var leftIndex = 0, rightIndex = 0;
    var left = this.origin.x, right = this.origin.x;

    for (var i = 0; i < this.count; i++) {
      var coords = this.coordinateGenerator();
      this.particles.push(
        new Particle(
          coords,
          getRandomColor(this.colors),
          radiusGenerator()
        )
      );
      if (coords.x < left) { left = coords.x; leftIndex = i; }
      if (coords.x > right) { right = coords.x; rightIndex = i; }
    }
    this.leftIndex = leftIndex;
    this.rightIndex = rightIndex;
  };

  this.render = function() {
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].render();
    }
  };

  this.extremeParticle = function(dir) {
    if (dir === 'left') {
      return this.particles[this.leftIndex];
    }
    return this.particles[this.rightIndex];
  };

  this.send = function(system, time) {
    var particle1 = this.extremeParticle('right');
    var particle2 = system.extremeParticle('left');
    var vector = p5.Vector.sub(particle2.position, particle1.position);
    vector.set(vector.x, 0);
    var timeStep = dateFns.getSeconds(new Date()) / 60.0;
    vector.setMag(vector.mag() * timeStep);
    fill(getSecondsParticleColor(timeStep));
    ellipse(particle1.position.x + vector.x, 300, secondsParticleRadius);
  }
};

var remaining_system, passed_system;
var daysLeft = 0;
var running = false;
var startInput, startLabel, endInput, endLabel, button;

function setupForm() {
  startInput = createInput('', 'date');
  startInput.value('2017-08-20');
  startInput.position(windowWidth/3, 200);
  startInput.class('date');
  startLabel = createP('Start date');
  startLabel.position(windowWidth/3 - 120, 180);
  startLabel.class('label')

  endInput = createInput('01/06/2020', 'date');
  endInput.value('2020-06-01');
  endInput.position(windowWidth/3, 270);
  endInput.class('date');
  endLabel = createP('End date');
  endLabel.position(windowWidth/3 - 120, 250);
  endLabel.class('label');

  button = createButton('Submit');
  button.position(windowWidth/3, 350);
  button.class('button');
  button.mousePressed(onSubmit);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  ellipseMode(CENTER);
  setupForm();
}

function draw() {
  background(255);
  noStroke();
  if (running) {
    renderText();
    remaining_system.send(passed_system);
    remaining_system.render();
    passed_system.render();
  }
}

function renderText() {
  fill(0);
  textAlign(CENTER);
  textSize(16);
  //text('Time is fleeting.', windowWidth/2, windowHeight - 70);
  text(days_left + ' day(s) left.', windowWidth/2, windowHeight -300);
}

function onSubmit() {
  var start = new Date(startInput.value());
  var end = new Date(endInput.value());
  var today = new Date();

  var passed = dateFns.differenceInDays(today, start);
  var remaining = dateFns.differenceInDays(end, today);

  days_left = remaining;
  remaining_system = new ParticleSystem(remaining_center, remaining, remaining_colors);
  passed_system = new ParticleSystem(passed_center, passed, passed_colors);

  remaining_system.setup();
  passed_system.setup();

  startInput.remove();
  startLabel.remove();
  endInput.remove();
  endLabel.remove();
  button.remove();

  running = true;
}
