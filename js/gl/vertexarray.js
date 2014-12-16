/**
 * Created by ashi on 2014-12-11.
 */

function VertexAttrib(name, location, numComponents) {
    this.name = name;
    this.location = location;
    this.numComponents = numComponents;
};

function VertexArray(attribs) {
    this.attribs = attribs;
    this.vertices = [];
    this.indices = [];
    this.vertexBuffer = null;
    this.indexBuffer = null;

    this.vao = 0;
    this.vbo = 0;
    this.ibo = 0;

    this.numComponents = 0;
    _.forEach(attribs, function(attrib) {
        this.numComponents += attrib.numComponents;
    }, this);

    this.stride = this.numComponents * 4; // 4 bytes per float

    this.initBuffers();
}

VertexArray.prototype.createArrays = function() {
    this.vertexBuffer = new Float32Array(this.vertices);
    this.indexBuffer = new Uint16Array(this.indices);
};

VertexArray.prototype.clear = function() {
    this.vertices = [];
    this.indices = [];
};

VertexArray.prototype.initBuffers = function() {
    this.vao = glExt.createVertexArrayOES();
    glExt.bindVertexArrayOES(this.vao);

    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);

    //gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 28, 0);
    //gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 28, 12);
    //// set up vertex attributes
    var offset = 0; // the offset in bytes per vertex attribute
    _.forEach(this.attribs, function(attrib) {
        gl.vertexAttribPointer(attrib.location, attrib.numComponents, gl.FLOAT, false, this.stride, offset);
        offset += attrib.numComponents * 4;
    }, this);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    glExt.bindVertexArrayOES(null);

    this.ibo = gl.createBuffer();
};

VertexArray.prototype.bind = function() {
    glExt.bindVertexArrayOES(this.vao);
    _.forEach(this.attribs, function(attrib) {
        gl.enableVertexAttribArray(attrib.location);
    }, this);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
};

VertexArray.prototype.unbind = function() {
    _.forEach(this.attribs, function(attrib) {
        gl.disableVertexAttriBarray(attrib.location);
    }, this);

    glExt.bindVertexArrayOES(null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

VertexArray.prototype.bufferVertexData = function(mode) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    if (mode)
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexBuffer, mode);
    else
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexBuffer, gl.STREAM_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

VertexArray.prototype.bufferIndexData = function(mode) {
    if (mode)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer, mode);
    else
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer, gl.STREAM_DRAW);
};

VertexArray.prototype.bufferData = function(mode) {
    this.bufferVertexData(mode);
    this.bufferIndexData(mode);
};

VertexArray.prototype.drawElements = function(mode, count) {
    if (mode) {
        if (count)
            gl.drawElements(mode, count, gl.UNSIGNED_SHORT, 0);
        else
            gl.drawElements(mode, this.indexBuffer.length, gl.UNSIGNED_SHORT, 0);
    } else
        gl.drawElements(gl.TRIANGLES, this.indexBuffer.length, gl.UNSIGNED_SHORT, 0);
};