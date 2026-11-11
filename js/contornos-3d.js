function createHeightOutlineLayer(center) {
    'use strict';

    var origin = maplibregl.MercatorCoordinate.fromLngLat(center);
    var vertices = new Float32Array(0);
    var selectedVertices = new Float32Array(0);
    var buffer;
    var selectedBuffer;
    var program;
    var matrixLocation;
    var positionLocation;
    var offsetLocation;
    var colorLocation;
    var map;
    var gl;

    function compileShader(type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            var message = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error('No se pudo compilar el contorno 3D: ' + message);
        }
        return shader;
    }

    function upload() {
        if (!gl) return;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, selectedBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, selectedVertices, gl.DYNAMIC_DRAW);
        map.triggerRepaint();
    }

    function appendPoint(points, point, height) {
        var coord = maplibregl.MercatorCoordinate.fromLngLat(point, height);
        points.push(coord.x - origin.x, coord.y - origin.y, coord.z);
    }

    return {
        id: 'height-outlines',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function (mapInstance, context) {
            map = mapInstance;
            gl = context;
            var vertexShader = compileShader(gl.VERTEX_SHADER,
                'uniform mat4 u_matrix; uniform vec2 u_offset; attribute vec3 a_position; void main() { gl_Position = u_matrix * vec4(a_position, 1.0); gl_Position.xy += u_offset * gl_Position.w; }');
            var fragmentShader = compileShader(gl.FRAGMENT_SHADER,
                'precision mediump float; uniform vec4 u_color; void main() { gl_FragColor = u_color; }');
            program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                throw new Error('No se pudo iniciar el contorno 3D: ' + gl.getProgramInfoLog(program));
            }
            positionLocation = gl.getAttribLocation(program, 'a_position');
            matrixLocation = gl.getUniformLocation(program, 'u_matrix');
            offsetLocation = gl.getUniformLocation(program, 'u_offset');
            colorLocation = gl.getUniformLocation(program, 'u_color');
            buffer = gl.createBuffer();
            selectedBuffer = gl.createBuffer();
            upload();
        },
        setFeatures: function (features) {
            var points = [];
            features.forEach(function (feature) {
                var height = feature.properties.height;
                if (height <= 0) return;
                var geometry = feature.geometry;
                var polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
                polygons.forEach(function (polygon) {
                    polygon.forEach(function (ring) {
                        for (var i = 1; i < ring.length; i++) {
                            [ring[i - 1], ring[i]].forEach(function (point) {
                                // Keep the outline just above the roof to avoid depth flicker.
                                appendPoint(points, point, height + 0.05);
                            });
                        }
                    });
                });
            });
            vertices = new Float32Array(points);
            upload();
        },
        setSelected: function (feature, height) {
            var points = [];
            if (feature && feature.geometry && height > 0) {
                var geometry = feature.geometry;
                var polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
                polygons.forEach(function (polygon) {
                    polygon.forEach(function (ring) {
                        for (var i = 1; i < ring.length; i++) {
                            var start = ring[i - 1];
                            var end = ring[i];
                            appendPoint(points, start, 0);
                            appendPoint(points, end, 0);
                            appendPoint(points, start, height + 0.05);
                            appendPoint(points, end, height + 0.05);
                            appendPoint(points, start, 0);
                            appendPoint(points, start, height + 0.05);
                        }
                    });
                });
            }
            selectedVertices = new Float32Array(points);
            upload();
        },
        render: function (context, matrix) {
            if (!vertices.length && !selectedVertices.length) return;
            // Relative coordinates preserve precision at high zoom levels.
            var translated = new Float32Array(matrix);
            for (var i = 0; i < 4; i++) {
                translated[12 + i] = matrix[i] * origin.x + matrix[4 + i] * origin.y + matrix[12 + i];
            }
            gl.useProgram(program);
            gl.uniformMatrix4fv(matrixLocation, false, translated);
            gl.enableVertexAttribArray(positionLocation);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.depthMask(false);
            gl.lineWidth(1);
            function drawLines(lineBuffer, count, color, radius) {
                if (!count) return;
                gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
                gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
                gl.uniform4fv(colorLocation, color);
                // WebGL implementations commonly restrict lineWidth to one pixel.
                for (var x = -radius; x <= radius; x++) {
                    for (var y = -radius; y <= radius; y++) {
                        if (Math.abs(x) + Math.abs(y) > radius) continue;
                        if (radius === 1 && (x < 0 || y < 0)) continue;
                        gl.uniform2f(offsetLocation, 2 * x / gl.drawingBufferWidth, 2 * y / gl.drawingBufferHeight);
                        gl.drawArrays(gl.LINES, 0, count);
                    }
                }
            }
            drawLines(buffer, vertices.length / 3, [0.13, 0.13, 0.13, 1], 1);
            drawLines(selectedBuffer, selectedVertices.length / 3, [0.88, 0, 0, 1], 2);
            gl.disableVertexAttribArray(positionLocation);
        },
        onRemove: function () {
            gl.deleteBuffer(buffer);
            gl.deleteBuffer(selectedBuffer);
            gl.deleteProgram(program);
            buffer = null;
            selectedBuffer = null;
            program = null;
            gl = null;
            map = null;
        }
    };
}
