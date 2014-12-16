/**
 * Created by ashi on 2014-12-16.
 */

var BeerApp = {};

BeerApp.init = function (canvas) {
    gl = glUtils.initGL(canvas);
    if (gl == null)
        return false;

    this.canvas = canvas;


    this.initGL();
    ShaderPrograms.initPrograms();
    this.initPipeline();
    this.initLighting();

    this.mug = null;
    this.beer = null;
    this.mugModel = null;
    this.beerModel = null;
    this.opaqueModels = [];
    this.translucentModels = [];

    this.initBeerColors();
    this.initModels();
    this.mousePos = null;

    canvas.addEventListener('mousemove', function(evt) {
        var rect = canvas.getBoundingClientRect();
        var width = canvas.width;
        var height = canvas.height;
        var x = (evt.clientX-rect.left)/(rect.right-rect.left)*width;
        var y = (evt.clientY-rect.top)/(rect.bottom-rect.top)*height;
        BeerApp.mousePos = {x: x - width/2, y: height / 2 - y};
    });

    canvas.addEventListener('click', function(evt) {
        BeerApp.fillBeer(0.2);
    });

    canvas.addEventListener('dragover', function (evt) {
        evt.preventDefault();
    });

    canvas.addEventListener('drop', function (evt) {
        evt.preventDefault();
        var beerId = evt.dataTransfer.getData("beerId");
        var beer;
        if (beerId && (beer = globals.inventory.getBeer(beerId))) {
            var type = beer['varugrupp'];
            if (type.indexOf(globals.beerTypes.DARK_LAGER) != -1 || type.indexOf(globals.beerTypes.PORTER_AND_STOUT) != -1)
                BeerApp.setBeerColor(BeerApp.beerColors.dark);
            else if (type.indexOf(globals.beerTypes.ALE) != -1)
                BeerApp.setBeerColor(BeerApp.beerColors.ale);
            else
                BeerApp.setBeerColor(BeerApp.beerColors.lager);
            BeerApp.fillBeer(0.5);
        }
    });

    $("#beerCanvas").css('background-color', 'rgba(0, 0, 0, 1');

    return true;
};

BeerApp.initGL = function() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.blend
    glExt = gl.getExtension("OES_vertex_array_object");
    glUtils.resize();
};

BeerApp.initPipeline = function() {
    var pipeline = new Pipeline();
    pipeline.watchProgram(ShaderPrograms.defaultProgram);
    pipeline.watchProgram(ShaderPrograms.lightingProgram);
    mat4.perspective(pipeline.uPMatrix, 45 * Math.PI / 180, this.canvas.width / this.canvas.height, 1, 25);
    mat4.translate(pipeline.uVMatrix, pipeline.uVMatrix, [0, -0.5, -10]);
    mat4.rotate(pipeline.uVMatrix, pipeline.uVMatrix, 0.45, [1, 0, 0]);

    pipeline.update();
    pipeline.updatePrograms();
    this.pipeline = pipeline;
};

BeerApp.initLighting = function() {
    var lightDir = vec3.create();
    vec3.normalize(lightDir, [1, -1, -0.6]);
    vec3.normalize(lightDir, [0, -1, -0.6]);
    var lightPos = this.lightPos = [-2, 3, 0];

    ShaderPrograms.lightingProgram.use();
    ShaderPrograms.lightingProgram.setUniform3f("ambientLight", 0.2, 0.2, 0.15);
    ShaderPrograms.lightingProgram.setUniform3f("lightDirection", lightDir[0], lightDir[1], lightDir[2]);
    ShaderPrograms.lightingProgram.setUniform3f("directionalLight", 1.2, 0.8, 1);

    ShaderPrograms.lightingProgram.setUniform3f("pointLight", 1, 0, 0);
    ShaderPrograms.lightingProgram.setUniform3f("lightPos", lightPos[0], lightPos[1], lightPos[2]);
    ShaderPrograms.lightingProgram.setUniform1f("attenuationFactor", 0.05);

    //ShaderPrograms.lightingProgram.setUniform3f("ambientLight", 0.1, 0.1, 0.1);
    ShaderPrograms.lightingProgram.setUniform3f("directionalLight", 0, 0.4, 0.5);
};

BeerApp.updateLighting = function() {
    var lightPos = this.lightPos;
    ShaderPrograms.lightingProgram.setUniform3f("lightPos", lightPos[0], lightPos[1], lightPos[2]);
};

BeerApp.updateLightPos = function() {
    var x = this.mousePos.x;
    var y = this.mousePos.y;
    var w = this.canvas.width;
    var h = this.canvas.width;
    this.lightPos[0] = x * 4 / w;
    this.lightPos[1] = y * 4 / h;
    this.lightPos[2] = 2;
};

BeerApp.initBeerColors = function() {
    var beerColors = {};
    beerColors.lager = [1, 0.65, 0, 0.98];
    beerColors.ale = [1, 0.3, 0, 1];
    beerColors.dark = [0.5, 0.2, 0.1, 1];
    this.beerColors = beerColors;
};

BeerApp.initModels = function() {
    this.initBox();
    this.initBeerMug(12);
};

BeerApp.initBox = function() {
    var mesh = new Geometry(ShaderPrograms.nattribs, true);

    // front
    var vertices = [
        [-1, -1, 1],
        [1, -1, 1],
        [1, 1, 1],
        [-1, 1, 1],
        [-1, -1, -1],
        [1, -1, -1],
        [1, 1, -1],
        [-1, 1, -1]
    ];

    mesh.addVertices(vertices);

    var colors = [
        [1.0, 0.0, 0.0, 1.0],     // Front face
        [1.0, 0.5, 0.0, 1.0],     // Back face
        [1, 0, 0, 1.0],     // Top face
        [0, 0.5, 0.5, 1.0],     // Bottom face
        [1.0, 0.0, 1.0, 1.0],     // Right face
        [0.0, 0.0, 1.0, 1.0]     // Left face
    ];

    mesh.addParams(colors);

    var faces = [
        [[0, 0], [1, 0], [2, 0], [3, 0]], // front
        [[5, 1], [4, 1], [7, 1], [6, 1]], // back
        [[3, 2], [2, 2], [6, 2], [7, 2]], // top
        [[4, 3], [5, 3], [1, 3], [0, 3]], // bottom
        [[1, 4], [5, 4], [6, 4], [2, 4]], // right
        [[4, 5], [0, 5], [3, 5], [7, 5]]  // left
    ];

    mesh.addFaces(faces);

    mesh.bufferData();

    var boxModel = new Model(mesh, vec3.set(vec3.create(), 4, 1, 1.5));
    mat4.translate(boxModel.modelMatrix, boxModel.modelMatrix, [0, -1.01, 0]);
    this.boxModel = boxModel;
    this.opaqueModels.push(boxModel);
};

BeerApp.initBeerMug = function(sides) {
    var n = sides;
    var mug = new Geometry(ShaderPrograms.nattribs, true);
    var beer = new Geometry(ShaderPrograms.nattribs, true);

    var r = 1;
    var h = 2.3;
    var alpha = 2 * Math.PI / n;

    var mugColor = [0.8, 0.8, 0.8, 0.25];
    var mugColorSolid = [0.52, 0.52, 0.52, 1];
    var beerColor = this.beerColors['lager'];
    mug.addParam(mugColor);
    mug.addParam(mugColorSolid);
    beer.addParam(beerColor);

    var mugBottom = [];
    var beerBottom = [];

    var mugBottomFace = [];
    var beerBottomFace = [];
    var innerBottomFace = [];
    for (var i = 0; i < n; i++) {
        mugBottom.push([r * Math.sin(i * alpha), 0, r * Math.cos(i * alpha)]);
        beerBottom.push([r * Math.sin(i * alpha) / 1.2, 0.2, r * Math.cos(i * alpha) / 1.2]);
        mugBottomFace.push([i, 1]);
        beerBottomFace.push([i, 0]);
        innerBottomFace.push([2 *n + i, 0]);
    }
    var top = [];
    var beerTop = [];
    var mugInnerTop = [];
    var topFace = [];

    for (var i = 0; i < n; i++) {
        top.push([r * Math.sin(i * alpha), h, r * Math.cos(i * alpha)]);
        beerTop.push([r * Math.sin(i * alpha) / 1.201, h / 1.7, r * Math.cos(i * alpha) / 1.201]);
        mugInnerTop.push([r * Math.sin(i * alpha) / 1.2, h, r * Math.cos(i * alpha) / 1.2]);
        topFace.push([n + i, 0]);
    }

    mug.addVertices(mugBottom);
    mug.addFace(mugBottomFace);
    mug.addVertices(top);
    mug.addVertices(beerBottom);
    mug.addVertices(mugInnerTop);
    mug.addFace(innerBottomFace);

    beer.addVertices(beerBottom);
    beer.addFace(beerBottomFace);
    beer.addVertices(beerTop);
    beer.addFace(topFace);

    for (var i = 2 * n; i < 3 * n - 1; i++) {
        var sideFace = [];
        sideFace.push([i, 0]);
        sideFace.push([i+1, 0]);
        sideFace.push([n + i+1, 0]);
        sideFace.push([n + i, 0]);
        mug.addFace(sideFace);
    }
    var sideFace = [];
    sideFace.push([3 * n - 1, 0]);
    sideFace.push([2 * n, 0]);
    sideFace.push([3 * n, 0]);
    sideFace.push([4 * n - 1, 0]);
    mug.addFace(sideFace);


    for (var i = 0; i < n - 1; i++) {
        var sideFace = [];
        sideFace.push([i, 0]);
        sideFace.push([i+1, 0]);
        sideFace.push([n + i+1, 0]);
        sideFace.push([n + i, 0]);
        mug.addFace(sideFace);
        beer.addFace(sideFace);
    }
    var sideFace = [];
    sideFace.push([n - 1, 0]);
    sideFace.push([0, 0]);
    sideFace.push([n, 0]);
    sideFace.push([2 * n - 1, 0]);
    mug.addFace(sideFace);
    beer.addFace(sideFace);

    for (var i = 0; i < n - 1; i ++) {
        mug.addFace([[n + i, 0], [n + i + 1, 0], [3 * n + i + 1, 0], [3 * n + i, 0]]);
    }
    mug.addFace([[2 * n - 1, 0], [n, 0], [3 * n, 0], [4 * n - 1, 0]]);

    mug.bufferData();
    beer.bufferData();

    beer.bottom = 0.2;
    beer.max = h*0.95;
    beer.top = beer.bottom;
    beer.height = 0;
    beer.sides = n;

    this.mug = mug;
    this.beer = beer;
    this.mugModel = new Model(mug);
    this.beerModel = new Model(beer);
    var model = new Model(mug);
    mat4.translate(model.modelMatrix, model.modelMatrix, [3, 0, 0]);
    this.translucentModels.push(model);
    this.translucentModels.push(this.mugModel);
};

BeerApp.setBeerHeight = function(h) {
    var beer = this.beer;
    if (h > beer.top - beer.bottom)
        h = beer.top - beer.bottom;
    var n = beer.sides;

    for (var i = 0; i < n; i++) {
        beer.vertices[n + i][1] = beer.bottom + h;
    }
    beer.bufferData();
    beer.height = h;
};

BeerApp.setBeerColor = function(color) {
    this.beer.params[0] = color;
};

BeerApp.fillBeer = function (dtop) {
    var beer = this.beer;
    if (dtop > beer.max - beer.top)
        dtop = beer.max - beer.top;
    beer.top += dtop;
};

BeerApp.update = function() {
    mat4.rotate(this.pipeline.uVMatrix, this.pipeline.uVMatrix, 0.005, [0, 1, 0]);
    //mat4.rotate(this.beerModel.modelMatrix, this.beerModel.modelMatrix, 0.0025, [0, 1, 0]);
    //mat4.rotate(this.mugModel.modelMatrix, this.mugModel.modelMatrix, 0.0025, [0, 1, 0]);

    var beerHeight = this.beer.height;
    if (beerHeight + 0.005 < this.beer.top - this.beer.bottom) {
        this.setBeerHeight(beerHeight + 0.005);
    }
    else if (this.beer.top > this.beer.bottom + 0.0005) {
        this.beer.top -= 0.0005;
        this.setBeerHeight(beerHeight - 0.0005);
    }

};

BeerApp.render = function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var viewMatrix = this.pipeline.uVMatrix;

    _.forEach(this.opaqueModels, function (model) {
        model.render(viewMatrix, ShaderPrograms.lightingProgram);
    }, this);

    if (this.beer.height > 0) {
        this.beerModel.render(viewMatrix, ShaderPrograms.lightingProgram);
    }

    _.forEach(this.translucentModels, function (model) {model.updateMatrices(viewMatrix)});

    this.translucentModels.sort(function (modelA, modelB) {
        return modelA.modelViewMatrix[14] - modelB.modelViewMatrix[14];
    });

    _.forEach(this.translucentModels, function (model) {
        model.render(viewMatrix, ShaderPrograms.lightingProgram);
    }, this);

};

BeerApp.run = function() {
    BeerApp.loop();
};

BeerApp.loop = function() {
    BeerApp.update();
    BeerApp.render();
    requestAnimationFrame(BeerApp.loop);
};
