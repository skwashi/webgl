/**
 * Created by ashi on 2014-12-11.
 */

function Batch(attribs, capacity, mode) {
    this.vertexArray = new VertexArray(attribs);
    this.vertexCount = 0;
    this.capacity = capacity;
    this.mode = mode || gl.TRIANGLES;
    this.batching = false;
    this.program = null;
}

Batch.prototype.attachProgram = function(program) {
    this.program = program;
};

Batch.prototype.bind = function() {
    this.vertexArray.bind();
};

Batch.prototype.flush = function() {
    this.vertexArray.createArrays();
    this.bind();
    this.vertexArray.bufferData(gl.STREAM_DRAW);
    this.render();
    this.vertexArray.clear();
    this.vertexCount = 0;
};

Batch.prototype.finalize = function() {
    if (this.batching) {
        this.vertexArray.createArrays();
        this.vertexArray.bind();
        this.vertexArray.bufferData(gl.STATIC_DRAW);
        this.batching = false;
    }
};

Batch.prototype.flushCheck = function(count) {
    if (this.vertexCount + count > this.vertexCapacity)
        this.flush();
};

Batch.prototype.render = function(mode) {
    if (this.program)
        this.program.use();
    this.vertexArray.drawElements(mode || this.mode);
};

Batch.prototype.begin = function() {
    this.batching = true;
};

Batch.prototype.end = function() {
    if (this.batching)
        this.flush();
    this.batching = false;
};

Batch.prototype.addVertices = function(vertices) {
    _.forEach(vertices, function (vertex) {
        for (var i = 0, count = vertex.length; i < count; i++)
            this.vertexArray.push(vertex[i]);
    }, this);
};

Batch.prototype.addVertex = function(vertex) {
    for (var i = 0, count = vertex.length; i < count; i++)
        this.vertexArray.vertices.push(vertex[i]);
};

Batch.prototype.addFace = function(v1, v2, v3, offset) {
    var offset = offset || this.vertexCount;
    this.vertexArray.indices.push(offset + v1, offset + v2, offset + v3);
};

Batch.prototype.addTriangle = function(offset) {
    var offset = offset || this.vertexCount;
    this.vertexArray.indices.push(offset, offset + 1, offset + 2);
};

Batch.prototype.addQuad = function(offset) {
    var offset = offset || this.vertexCount;
    this.vertexArray.indices.push(offset, offset + 1, offset + 2);
    this.vertexArray.indices.push(offset, offset + 2, offset + 3);
};

Batch.prototype.addLine = function(offset) {
    var offset = offset || this.vertexCount;
    this.vertexArray.indices.push(offset, offset + 1);
};

Batch.prototype.addPoint = function(offset) {
    var offset = offset || this.vertexCount;
    this.vertexArray.indices.push(offset);
};

Batch.prototype.drawTriangle = function(v1, v2, v3) {
    this.flushCheck(3);
    this.addVertex(v1);
    this.addVertex(v2);
    this.addVertex(v3);
    this.addTriangle();

    this.vertexCount += 3;
};

Batch.prototype.drawQuad = function(v1, v2, v3, v4) {
    this.flushCheck(4);
    this.addVertex(v1);
    this.addVertex(v2);
    this.addVertex(v3);
    this.addVertex(v4);
    this.addQuad();

    this.vertexCount += 4;
};

Batch.prototype.drawPoint = function(x, y, size, r, g, b, a) {
    this.flushCheck(4);
    var hs = size / 2;
    this.vertexArray.vertices.push(
        x-hs, y-hs, 0, r, g, b, a,
        x+hs, y-hs, 0, r, g, b, a,
        x+hs, y+hs, 0, r, g, b, a,
        x-hs, y+hs, 0, r, g, b, a);

    this.addQuad();
    this.vertexCount += 4;
};

Batch.prototype.drawPolygon = function(vertices) {
    var count = vertices.length;
    this.flushCheck(count);

    for (var i = 0; i < count; i++)
        this.addVertex(vertices[i]);
    for (var j = 1; j < count - 1; j++)
        this.addFace(0, j, j + 1);

    this.vertexCount += count;
};
