/**
 * Created by ashi on 2014-12-16.
 */

function Model(geometry, material, scale) {
    this.geometry = geometry;
    this.material = material || new Material([0, 0, 0], 1);
    this.scale = scale || vec3.set(vec3.create(), 1, 1, 1);
    this.modelMatrix = mat4.create();
    this.modelViewMatrix = mat4.create();
    this.normalMatrix = mat4.create();
    mat4.scale(this.modelMatrix, this.modelMatrix, this.scale);
}

Model.prototype.updateMatrices = function(viewMatrix) {
    mat4.multiply(this.modelViewMatrix, viewMatrix, this.modelMatrix);
    mat4.invert(this.normalMatrix, this.modelMatrix);
    mat4.transpose(this.normalMatrix, this.normalMatrix);
};

Model.prototype.render = function(program) {
    program.use();
    program.setUniformMatrix4("uMMatrix", this.modelMatrix);
    program.setUniformMatrix4("uNormalMatrix", this.normalMatrix);

    var material = this.material;
    if (material) {
        program.setUniform3f("specular", material.specular[0], material.specular[1], material.specular[2]);
        program.setUniform1f("shininess", material.shininess);
    }
    this.geometry.render();
};