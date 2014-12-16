/**
 * Created by ashi on 2014-12-11.
 */

function Geometry(attribs, useNormals) {
    this.attribs = attribs;
    this.useNormals = useNormals || false;
    this.vertexArray = new VertexArray(attribs);

    this.vertices = [];
    this.normals = [];
    this.params = [];
    this.faces = [];
}

Geometry.union = function(g1, g2) {
    var vertexCount1 = g1.vertices.length;
    var paramCount1 = g1.params.length;
    var geometry = new Geometry(g1.attribs, g1.useNormals);
    geometry.addVertices(g1.vertices);
    geometry.addVertices(g2.vertices);
    geometry.addParams(g1.params);
    geometry.addParams(g2.params);
    geometry.addFaces(g1.faces);

    _.forEach(g2.faces, function(face) {
        var newFace = [];
        _.forEach(face, function (v) {
            console.log(v);
            newFace.push([v[0] + vertexCount1, v[1] + paramCount1]);
        });
        geometry.addFace(newFace);
    });

    return geometry;
};

Geometry.prototype.addVertex = function(v) {
    this.vertices.push(v);
};

Geometry.prototype.addVertices = function (vs) {
    _.forEach(vs, function (v) {
        this.vertices.push(v);
    }, this);
};

Geometry.prototype.addParam = function(param) {
    this.params.push(param);
};

Geometry.prototype.addParams = function (ps) {
    _.forEach(ps, function (p) {
        this.params.push(p);
    }, this);
};

Geometry.prototype.addFace = function(face) {
    var count = this.faces.length;
    this.faces.push(face);
    var normal = vec3.create();
    var p1 = this.vertices[face[0][0]];
    var p2 = this.vertices[face[1][0]];
    var p3 = this.vertices[face[2][0]];
    var v1 = vec3.create();
    var v2 = vec3.create();
    vec3.subtract(v1, p2, p1);
    vec3.subtract(v2, p3, p2);
    vec3.cross(normal, v1, v2);
    vec3.normalize(normal, normal);
    this.normals[count] = normal;
};

Geometry.prototype.addFaces = function (fs) {
    _.forEach(fs, function (f) {
        this.addFace(f);
    }, this);
};

Geometry.prototype.bufferData = function() {
    this.vertexArray.clear();
    var vertices = this.vertexArray.vertices;
    var indices = this.vertexArray.indices;
    var vertexCount = 0;

    var faceCount = this.faces.length;
    for (var f = 0; f < faceCount; f++) {
        var face = this.faces[f];
        var count = face.length;
        for (var i = 0; i < count; i += 1) {
            _.forEach(this.vertices[face[i][0]], function(x) {
                vertices.push(x);
            });
            _.forEach(this.params[face[i][1]], function(c) {
                vertices.push(c);
            });
            if (this.useNormals)
                _.forEach(this.normals[f], function (x) {
                    vertices.push(x);
                });
        }
        for (var j = 1; j < count - 1; j+=1)
            indices.push(vertexCount, vertexCount + j, vertexCount + j + 1);
        vertexCount += count;
    }
    this.vertexArray.createArrays();
    this.vertexArray.bind();
    this.vertexArray.bufferData(gl.STATIC_DRAW);
};

Geometry.prototype.render = function() {
    this.vertexArray.bind();
    this.vertexArray.drawElements();
};