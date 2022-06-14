let canvas = document.querySelector("canvas");

let gl = WebGLUtils.setupWebGL(canvas);

let points = [];
let subdivisions = 5;

function triangle(a, b, c) {
  points.push(a, b, c);
}

function divideTriangle(a, b, c, count) {
  if (!count) {
    triangle(a, b, c);
  } else {
    count--;

    /**
     * Perform bisection
     */
    let ab = mix(a, b, 0.3);
    let ac = mix(a, c, 0.2);
    let bc = mix(b, c, 0.3);

    /**
     * Create three new triangles
     */
    divideTriangle(a, ab, ac, count);
    divideTriangle(c, ac, bc, count);
    divideTriangle(b, bc, ab, count);
  }
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, points.length);
}

window.onload = () => {
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it");
  }

  /**
   * first triangle coordinates
   */
  let vertices = [vec2(0, 1), vec2(1, -1), vec2(-1, -1)];

  gl.viewport(0, 0, canvas.width, canvas.height);

  /**
   * Background color
   */
  gl.clearColor(34 / 255, 34 / 255, 51 / 255, 1);

  /**
   * Load shaders and initialize attribute buffers
   * These are stored in the HTML file
   */
  let program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  divideTriangle(vertices[0], vertices[1], vertices[2], subdivisions);

  /**
   * Load the data into the GPU
   */
  let bufferId = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  /**
   * Flush out shader variables with our data buffer
   */
  let vPosition = gl.getAttribLocation(program, "vPosition");

  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  render();
};
