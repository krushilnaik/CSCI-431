"use strict";

var gl;

var theta = 0.0;
var thetaLoc;

var speed = 100;
var direction = true;

var color = vec4(1.0, 0.0, 0.0, 1.0);
var fcolorLoc;

window.onload = function init() {
  var canvas = document.querySelector("canvas");

  gl = canvas.getContext("webgl2");
  if (!gl) alert("WebGL 2.0 isn't available");

  //  Configure WebGL

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  //  Load shaders and initialize attribute buffers

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  var vertices = [vec2(0, 0.5), vec2(-0.5, -0.366), vec2(0.5, -0.366)];

  // Load the data into the GPU

  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  // Associate out shader variables with our data buffer

  var positionLoc = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLoc);

  fcolorLoc = gl.getUniformLocation(program, "fcolor");
  thetaLoc = gl.getUniformLocation(program, "uTheta");

  // Initialize event handlers

  document.getElementById("slider").onchange = function (event) {
    speed = 100 - event.target.value;
  };
  document.getElementById("Direction").onclick = function (event) {
    direction = !direction;
  };

  document.getElementById("Controls").onclick = function (event) {
    switch (event.target.index) {
      case 0:
        direction = !direction;
        break;

      case 1:
        speed /= 2.0;
        break;

      case 2:
        speed *= 2.0;
        break;

      case 3:
        color = vec4(1.0, 0.0, 0.0, 1.0);
        break;

      case 4:
        color = vec4(0.0, 1.0, 0.0, 1.0);
        break;

      case 5:
        color = vec4(0.0, 0.0, 1.0, 1.0);
        break;

      case 6:
        color = vec4(0.0, 0.0, 0.0, 1.0);
        break;
    }
  };

  window.onkeydown = function (event) {
    var key = String.fromCharCode(event.keyCode);
    switch (key) {
      case "1":
        direction = !direction;
        break;

      case "2":
        speed /= 2.0;
        break;

      case "3":
        speed *= 2.0;
        break;

      case "4":
        color = vec4(1.0, 0.0, 0.0, 1.0);
        break;

      case "5":
        color = vec4(0.0, 1.0, 0.0, 1.0);
        break;

      case "6":
        color = vec4(0.0, 0.0, 1.0, 1.0);
        break;

      case "7":
        color = vec4(0.0, 0.0, 0.0, 1.0);
    }
  };

  render();
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  theta += direction ? 0.1 : -0.1;
  gl.uniform1f(thetaLoc, theta);

  gl.uniform4f(fcolorLoc, color[0], color[1], color[2], color[3]);

  gl.drawArrays(gl.TRIANGLES, 0, 3);

  setTimeout(function () {
    requestAnimationFrame(render);
  }, speed);
}
