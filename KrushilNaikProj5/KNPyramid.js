"use strict";

let canvas, gl;

let numPositions = 12;

let positions = [];
let colors = [];
let xAxis = 0;
let yAxis = 1;
let zAxis = 2;
let direction = false;
let axis = 0; //default rotate with respect to the x-axis
let uTheta = [0, 0, 0];
let uThetaLoc;

let near = 0.3;
let far = 3.0; //when program is ran,this has to be adjusted to view pyramid
let radius = 4.0;
let theta = 0.0;
let phi = 0.0;
let dr = (5.0 * Math.PI) / 180.0;

let fovy = 45.0; // Field-of-view in Y direction angle (in degrees)
let aspect = 1.0; // Viewport aspect ratio

let modelViewMatrix, projectionMatrix;
let modelViewMatrixLoc, projectionMatrixLoc;
let eye;

const at = vec3(0, 0, 0);
const up = vec3(0, 1, 0);

let vertices = [
  vec4(0.5, -0.3, 0.3),
  vec4(0.0, -0.3, -0.6),
  vec4(-0.5, -0.3, 0.3),
  vec4(0.0, 0.5, 0.0),
];

let vertexColors = [
  vec4(1, 0, 0, 1),
  vec4(0, 1, 0, 1),
  vec4(0, 0, 1, 1),
  vec4(0, 0, 0.3, 1),
];

function colorPyramid() {
  triangle(0, 1, 2);
  triangle(1, 2, 3);
  triangle(2, 0, 3);
  triangle(3, 1, 0);
}

function triangle(a, b, c) {
  // We need to parition the pyramid into two triangles in order for
  // WebGL to be able to render it.

  //vertex color assigned by the index of the vertex

  let indices = [a, b, c];

  for (let i = 0; i < indices.length; i++) {
    positions.push(vertices[indices[i]]);

    // for solid colored faces use
    colors.push(vertexColors[a]);
  }
}

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = canvas.getContext("webgl2");
  if (!gl) alert("WebGL 2.0 isn't available");

  gl.viewport(0, 0, canvas.width, canvas.height);

  aspect = canvas.width / canvas.height;

  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  gl.enable(gl.DEPTH_TEST);

  //
  //  Load shaders and initialize attribute buffers
  //
  let program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  colorPyramid();

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

  modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

  uThetaLoc = gl.getUniformLocation(program, "uTheta");

  document.getElementById("zFarSlider").onchange = (event) => {
    far = event.target.value;
  };
  document.getElementById("zNearSlider").onchange = (event) => {
    near = event.target.value;
  };
  document.getElementById("radiusSlider").onchange = (event) => {
    radius = event.target.value;
  };
  document.getElementById("thetaSlider").onchange = (event) => {
    theta = (event.target.value * Math.PI) / 180.0;
  };
  document.getElementById("phiSlider").onchange = (event) => {
    phi = (event.target.value * Math.PI) / 180.0;
  };
  document.getElementById("aspectSlider").onchange = (event) => {
    aspect = event.target.value;
  };
  document.getElementById("fovSlider").onchange = (event) => {
    fovy = event.target.value;
  };

  document.getElementById("xButton").onclick = () => {
    axis = xAxis;
  };
  document.getElementById("yButton").onclick = () => {
    axis = yAxis;
  };
  document.getElementById("zButton").onclick = () => {
    axis = zAxis;
  };
  document.getElementById("Toggle-Rotation").onclick = () => {
    direction = !direction;
  };

  render();
};

function render() {
  eye = vec3(
    radius * Math.sin(theta) * Math.cos(phi),
    radius * Math.sin(theta) * Math.sin(phi),
    radius * Math.cos(theta)
  );

  modelViewMatrix = lookAt(eye, at, up);
  projectionMatrix = perspective(fovy, aspect, near, far);

  if (direction) {
    uTheta[axis] += 2.0;
  }

  gl.uniform3fv(uThetaLoc, uTheta);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

  gl.drawArrays(gl.TRIANGLES, 0, numPositions);
  requestAnimationFrame(render);
}
