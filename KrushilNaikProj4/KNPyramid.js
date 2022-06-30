"use strict";

let canvas, gl;
let numPositions = 12;
let positions = [];
let colors = [];
let xAxis = 0;
let yAxis = 1;
let zAxis = 2;
let axis = 0;
let theta = [0, 0, 0];
let thetaLoc;

let vertices = [
  vec4(0.5, -0.3, 0.3),
  vec4(0, -0.3, -0.6),
  vec4(-0.5, -0.3, 0.3),
  vec4(0, 0.5, 0),
];

let vertexColors = [
  vec4(1, 0, 0, 1),
  vec4(0, 1, 0, 1),
  vec4(0, 0, 1, 1),
  vec4(1, 1, 0, 1),
];

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = canvas.getContext("webgl2");

  if (!gl) {
    alert("Your browser does not support WebGL");
  }

  colorPyramid();

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1, 1, 1, 1);

  gl.enable(gl.DEPTH_TEST);

  /**
   * Load shaders and initialize attribute buffers
   */
  let program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  let cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  let colorLoc = gl.getAttribLocation(program, "aColor");
  gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(colorLoc);

  let vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

  let positionLoc = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLoc);

  thetaLoc = gl.getUniformLocation(program, "uTheta");

  document.getElementById("x-toggle").onclick = function () {
    axis = xAxis;
  };
  document.getElementById("y-toggle").onclick = function () {
    axis = yAxis;
  };
  document.getElementById("z-toggle").onclick = function () {
    axis = zAxis;
  };

  render();
};

function colorPyramid() {
  triangle(2, 1, 3);
  triangle(3, 1, 0);
  triangle(0, 1, 2);
  triangle(0, 2, 3);
}

function triangle(a, b, c) {
  // We need to parition the pyramid into two triangles in order for
  // WebGL to be able to render it.

  //vertex color assigned by the index of the vertex

  let indices = [a, b, c];

  for (const i of indices) {
    positions.push(vertices[i]);
    colors.push(vertexColors[a]);
  }
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  theta[axis] += 2;
  gl.uniform3fv(thetaLoc, theta);

  gl.drawArrays(gl.TRIANGLES, 0, numPositions);
  requestAnimationFrame(render);
}
