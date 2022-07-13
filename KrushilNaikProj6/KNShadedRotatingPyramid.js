"use strict";

let canvas;
let gl;

let numVertices = 36;

let pointsArray = [];
let normalsArray = [];

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

let lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
let lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
let lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
let lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

let materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
let materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
let materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
let materialShininess = 100.0;

let ctm;
let ambientColor, diffuseColor, specularColor;
let modelView, projection;
let viewerPos;
let program;

let xAxis = 0;
let yAxis = 1;
let zAxis = 2;
let axis = 0;
let theta = [0, 0, 0];

let thetaLoc;

let flag = true;

function triangle(a, b, c) {
  // We need to parition the pyramid into two triangles in order for
  // WebGL to be able to render it.

  //vertex color assigned by the index of the vertex

  let indices = [a, b, c];

  let t1 = subtract(vertexColors[b], vertexColors[c]);
  let t2 = subtract(vertexColors[c], vertexColors[a]);
  let normal = vec3(cross(t1, t2));

  for (let i = 0; i < indices.length; i++) {
    pointsArray.push(vertices[indices[i]]);
    normalsArray.push(normal);

    // for solid colored faces use
    //  colors.push(vertexColors[a]);
  }
}

function colorPyramid() {
  triangle(0, 1, 2);
  triangle(1, 2, 3);
  triangle(2, 0, 3);
  triangle(3, 1, 0);
}

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  gl.enable(gl.DEPTH_TEST);

  //
  //  Load shaders and initialize attribute buffers
  //
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  //   colorCube();
  colorPyramid();

  let cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

  let vNormal = gl.getAttribLocation(program, "vNormal");
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);

  let vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  let vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  thetaLoc = gl.getUniformLocation(program, "theta");

  viewerPos = vec3(0.0, 0.0, -20.0);

  projection = ortho(-1, 1, -1, 1, -100, 100);

  let ambientProduct = mult(lightAmbient, materialAmbient);
  let diffuseProduct = mult(lightDiffuse, materialDiffuse);
  let specularProduct = mult(lightSpecular, materialSpecular);

  document.getElementById("ButtonX").onclick = function () {
    axis = xAxis;
  };
  document.getElementById("ButtonY").onclick = function () {
    axis = yAxis;
  };
  document.getElementById("ButtonZ").onclick = function () {
    axis = zAxis;
  };
  document.getElementById("ButtonT").onclick = function () {
    flag = !flag;
  };

  gl.uniform4fv(
    gl.getUniformLocation(program, "ambientProduct"),
    flatten(ambientProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "diffuseProduct"),
    flatten(diffuseProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "specularProduct"),
    flatten(specularProduct)
  );
  gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));

  gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

  gl.uniformMatrix4fv(
    gl.getUniformLocation(program, "projectionMatrix"),
    false,
    flatten(projection)
  );

  render();
};

let render = function () {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (flag) theta[axis] += 2.0;

  modelView = mat4();
  modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0]));
  modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0]));
  modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1]));

  gl.uniformMatrix4fv(
    gl.getUniformLocation(program, "modelViewMatrix"),
    false,
    flatten(modelView)
  );

  gl.drawArrays(gl.TRIANGLES, 0, numVertices);

  requestAnimFrame(render);
};
