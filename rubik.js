var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var X = 40;
var Y = 110;
var SIDE = 50;
var TRANSFORM_Z_FACE = [
  [1, 0],
  [0, 1],
  [X, Y]
];
var TRANSFORM_Y_FACE = [
  [1, 0],
  [0.5, -0.5],
  [X, Y]
];
var TRANSFORM_X_FACE = [
  [0.5, -0.5],
  [0, 1],
  [X + 3 * SIDE, Y]
];
var FACE_X = 1;
var FACE_Y = 2;
var FACE_Z = 3;
var TRANSFORMS = {};
TRANSFORMS[FACE_X] = TRANSFORM_X_FACE;
TRANSFORMS[FACE_Y] = TRANSFORM_Y_FACE;
TRANSFORMS[FACE_Z] = TRANSFORM_Z_FACE;

var RED = 0;
var ORANGE = 1;
var BLUE = 2;
var GREEN = 3;
var WHITE = 4;
var YELLOW = 5;
var GREY = 6;

var CORNERS = [
  [WHITE, GREEN, ORANGE],
  [WHITE, ORANGE, BLUE],
  [WHITE, BLUE, RED],
  [WHITE, RED, GREEN],
  [YELLOW, GREEN, RED],
  [YELLOW, RED, BLUE],
  [YELLOW, BLUE, ORANGE],
  [YELLOW, ORANGE, GREEN]
];

var COLORS = ["red", "orange", "blue", "green", "white", "yellow", "grey"];
var COLOR_CSS = ["red", "orange", "blue", "green", "white", "yellow"];

var stats = { "total": 0, "correct": 0 };

var BUTTONS = COLOR_CSS.map(function (x) { return document.getElementById(x + "-button"); });
var NEXT_QUIZ_DELAY_MS = 1000;
var timer;

function setCookie(cname, cvalue, exdays = 60) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function updateStats() {
  document.getElementById("correct").textContent = stats.correct;
  document.getElementById("total").textContent = stats.total;
}

function loadStats() {
  var COOKIE = getCookie("rubik");
  if (COOKIE) {
    stats = JSON.parse(COOKIE);
  }
  updateStats();
}

function saveStats() {
  setCookie("rubik", JSON.stringify(stats));
}

function showSolution(element) {
  stats.total++;
  var solution = document.getElementById(SOLUTION_ID);
  solution.className = "correct";
  if (element != solution) {
    element.className = "wrong";
  }
  else {
    stats.correct++;
  }
  saveStats();
  updateStats();
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(nextQuiz, NEXT_QUIZ_DELAY_MS);
}

function resetButtons() {
  BUTTONS.forEach(function (x) { x.className = ""; });
}

function mul(vector, matrix) {
  vector.push(1);
  columns = matrix[0].length;
  result = new Array(columns);
  for (var i = 0; i < columns; i++) {
    result[i] = 0;
    for (var j = 0; j < vector.length; j++) {
      result[i] += vector[j] * matrix[j][i];
    }
  }
  return result;
}

function drawCubicle(x, y, color, face = FACE_Z) {
  transform = TRANSFORMS[face];
  ctx.beginPath();
  ctx.lineWidth = "1";
  ctx.strokStyle = "black";
  i = x * SIDE;
  j = y * SIDE;
  path = [[i, j], [i + SIDE, j], [i + SIDE, j + SIDE], [i, j + SIDE]];
  transformedPath = path.map(function (v) { return mul(v, transform); });
  ctx.moveTo(transformedPath[0][0], transformedPath[0][1]);
  for (var i = 1; i < transformedPath.length; i++) {
    ctx.lineTo(transformedPath[i][0], transformedPath[i][1]);
  }
  ctx.closePath();
  ctx.stroke();
  if (color) {
    ctx.fillStyle = color;
    ctx.fill();
  }
}

function getRandomInt(max) {
  min = 0;
  return Math.floor(Math.random() * (max - min)) + min;
}

function drawGreyCube(params) {
  for (var x = 0; x < 3; x++) {
    for (var y = 0; y < 3; y++) {
      drawCubicle(x, y, COLORS[GREY], FACE_Y);
      drawCubicle(x, y, COLORS[GREY], FACE_Z);
      drawCubicle(x, y, COLORS[GREY], FACE_X);
    }
  }
}

function generateQuiz() {
  corner = CORNERS[getRandomInt(CORNERS.length)];
  rotation = getRandomInt(corner.length);
  drawCubicle(2, 0, COLORS[corner[rotation]], FACE_X);
  drawCubicle(2, 2, COLORS[corner[(rotation + 1) % corner.length]], FACE_Y);
  backColor = corner[(rotation + 2) % corner.length];
  SOLUTION_ID = COLOR_CSS[backColor] + "-button";
}

function nextQuiz() {
  resetButtons();
  generateQuiz();
}

loadStats();
drawGreyCube();
generateQuiz();
