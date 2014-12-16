/**
 * Created by ashi on 2014-12-11.
 */

function initShader(script, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, script);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          alert(gl.getShaderInfoLog(shader));
          return null;
      }

      return shader;
}

function ShaderProgram(vertexShader, fragmentShader, attribs) {
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    this.attribs = attribs;

    this.uniforms = {};
    this.program = gl.createProgram();

    if (attribs != null)
        _.forEach(attribs, function(attrib) {
            gl.bindAttribLocation(this.program, attrib.location, attrib.name);
        }, this);

    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    this.cacheUniforms();
}

ShaderProgram.prototype.cacheUniforms = function() {
    this.uniforms = {};

    var activeUniforms = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < activeUniforms; i++) {
        var uniformName = gl.getActiveUniform(this.program, i).name;
        this.uniforms[uniformName] = gl.getUniformLocation(this.program, uniformName);
    }
};

ShaderProgram.prototype.hasUniform = function(name) {
    return this.uniforms.hasOwnProperty(name);
};

ShaderProgram.prototype.setUniform1f = function(name, f) {
    var loc = this.uniforms[name];
    if (loc)
        gl.uniform1f(loc, f);
};

ShaderProgram.prototype.setUniform2f = function(name, f1, f2) {
    var loc = this.uniforms[name];
    if (loc)
        gl.uniform2f(loc, f1, f2);
};

ShaderProgram.prototype.setUniform3f = function(name, f1, f2, f3) {
    var loc = this.uniforms[name];
    if (loc)
        gl.uniform3f(loc, f1, f2, f3);
};

ShaderProgram.prototype.setUniform4f = function(name, f1, f2, f3, f4) {
    var loc = this.uniforms[name];
    if (loc)
        gl.uniform4f(loc, f1, f2, f3, f4);
};

ShaderProgram.prototype.setUniformMatrix2 = function(name, matrix, transpose) {
    var loc = this.uniforms[name];
    if (loc)
        gl.uniformMatrix2fv(loc, transpose || false, matrix);
};

ShaderProgram.prototype.setUniformMatrix3 = function(name, matrix, transpose) {
    var loc = this.uniforms[name];
    if (loc)
        gl.uniformMatrix3fv(loc, transpose || false, matrix);
};

ShaderProgram.prototype.setUniformMatrix4 = function(name, matrix, transpose) {
    var loc = this.uniforms[name];
    if (loc)
        gl.uniformMatrix4fv(loc, transpose || false, matrix);
};

ShaderProgram.prototype.use = function() {
    gl.useProgram(this.program);
};