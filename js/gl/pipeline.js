/**
 * Created by ashi on 2014-12-11.
 */

function Pipeline() {
    this.uPMatrix = mat4.create();
    this.uVMatrix = mat4.create();
    this.uMMatrix = mat4.create();
    this.uVPMatrix = mat4.create();
    this.uMVMatrix = mat4.create();

    this.programs = [];
}

Pipeline.prototype.update = function() {
    mat4.multiply(this.uVPMatrix, this.uPMatrix, this.uVMatrix);
    mat4.multiply(this.uMVMatrix, this.uVMatrix, this.uMMatrix);
};

Pipeline.prototype.watchProgram = function(program) {
    this.programs.push(program);
};

Pipeline.prototype.updateMatrices = function(program) {
    program.use();
    if (program.hasUniform("uPMatrix"))
        program.setUniformMatrix4("uPMatrix", this.uPMatrix);
    if (program.hasUniform("uVMatrix"))
        program.setUniformMatrix4("uVMatrix", this.uVMatrix);
    if (program.hasUniform("uVPMatrix"))
        program.setUniformMatrix4("uVPMatrix", this.uVPMatrix);
};

Pipeline.prototype.updatePrograms = function() {
    _.forEach(this.programs, this.updateMatrices, this);
};