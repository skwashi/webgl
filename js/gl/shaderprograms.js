/**
 * Created by ashi on 2014-12-16.
 */

var ShaderPrograms = {};

ShaderPrograms.attribs = [new VertexAttrib("inPosition", 0, 3), new VertexAttrib("inColor", 1, 4)];
ShaderPrograms.nattribs = [new VertexAttrib("inPosition", 0, 3), new VertexAttrib("inColor", 1, 4), new VertexAttrib("inNormal", 2, 3)];

ShaderPrograms.initPrograms = function() {

    var vertexScript =
        "attribute vec3 inPosition;\n" +
        "attribute vec4 inColor;\n" +
        "uniform mat4 uPMatrix;\n" +
        "uniform mat4 uVMatrix;\n" +
        "varying vec4 passColor;\n" +
        "void main(void) {\n" +
        "    gl_Position = uPMatrix * uVMatrix * vec4(inPosition, 1.0);\n" +
        "    passColor = inColor;\n" +
        "}";

    var fragmentScript =
        "precision mediump float;\n" +
        "varying vec4 passColor;\n" +
        "void main(void) {\n" +
        "    gl_FragColor = passColor;\n" +
        "}";

    var lVertexScript =
        "attribute vec3 inPosition;\n" +
        "attribute vec4 inColor;\n" +
        "attribute vec3 inNormal;\n" +
        "uniform mat4 uPMatrix;\n" +
        "uniform mat4 uVMatrix;\n" +
        "uniform mat4 uMMatrix;\n" +
        "uniform mat4 uNormalMatrix;\n" +
        "varying vec4 passColor;\n" +
        "varying vec3 passNormal;\n" +
        "varying vec3 passPosition;\n" +
        "void main(void) {\n" +
        "    gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(inPosition, 1.0);\n" +
        "    passColor = inColor;\n" +
        "    passNormal = normalize((uNormalMatrix * vec4(inNormal, 0.0)).xyz);\n" +
        "    passPosition = (uMMatrix * vec4(inPosition, 1.0)).xyz;\n" +
        "}";

    var lFragmentScript =
        "precision mediump float;\n" +
        "uniform vec3 uCameraPosition;\n" +
        "uniform vec3 ambientLight;\n" +
        "uniform vec3 directionalLight;\n" +
        "uniform vec3 lightDirection;\n" +
        "uniform vec3 pointLight;\n" +
        "uniform vec3 lightPos;\n" +
        "uniform float attenuationFactor;\n" +
        "uniform vec3 specular;\n" +
        "uniform float shininess;\n" +
        "varying vec4 passColor;\n" +
        "varying vec3 passNormal;\n" +
        "varying vec3 passPosition;\n" +
        "void main(void) {\n" +
        "    vec3 surfToLight = lightPos - passPosition;\n" +
        "    float distance = length(surfToLight);\n" +
        "    surfToLight = surfToLight / distance;\n" +
        "    vec3 pointReflection = reflect(-surfToLight, passNormal);\n" +
        "    vec3 dirReflection = reflect(lightDirection, passNormal);\n" +
        "    vec3 surfToCam = normalize(uCameraPosition - passPosition);\n" +
        "    float cosPAngle = max(0.0, dot(pointReflection, surfToCam));\n" +
        "    float cosDAngle = max(0.0, dot(dirReflection, surfToCam));\n" +
        "    float attenuation = 1.0 / (1.0 + attenuationFactor * (distance + attenuationFactor * distance * distance));\n" +
        "    float pointDiffuseFactor = max(0.0, dot(passNormal, surfToLight)) * attenuation;\n" +
        "    vec3 pointSpecular = pointLight * pow(cosPAngle, shininess) * attenuation;\n" +
        "    vec3 dirSpecular = directionalLight * pow(cosDAngle, shininess);\n" +
        "    float diffuseFactor = max(0.0, -dot(passNormal, lightDirection));\n" +
        "    gl_FragColor = vec4((ambientLight + directionalLight * diffuseFactor + pointLight * pointDiffuseFactor) * passColor.rgb + specular * (dirSpecular + pointSpecular), passColor.a);\n" +
        "}";


    ShaderPrograms.defaultProgram = new ShaderProgram(initShader(vertexScript, gl.VERTEX_SHADER), initShader(fragmentScript, gl.FRAGMENT_SHADER), ShaderPrograms.attribs);
    ShaderPrograms.lightingProgram = new ShaderProgram(initShader(lVertexScript, gl.VERTEX_SHADER), initShader(lFragmentScript, gl.FRAGMENT_SHADER), ShaderPrograms.nattribs);
};
