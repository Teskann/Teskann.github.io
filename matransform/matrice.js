canvas = document.getElementById("myCanvas");
canvas.width = 0.8*window.innerWidth;
canvas.height = window.innerHeight;


var context = canvas.getContext('2d');

window.addEventListener("resize",() =>{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawEverything(matrix, zoom);
})

mouse = {x: -100, y: -100} // Coordinates of the mouse
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}
this.context.canvas.addEventListener("mousemove", event => {
// Updating mouse coordinates
this.mouse.x = getMousePos(this.context.canvas, event).x;
this.mouse.y = getMousePos(this.context.canvas, event).y;
});

context.canvas.addEventListener("click", e => {

})

context.canvas.addEventListener("wheel", e => {
    if(e.deltaY < 0){
        // Scroll up => Zoom +
        zoom *= 1.1;
        drawEverything(transformedMatrix, zoom);
    }
    else{
        // Scroll down => Zoom -
        zoom *= 0.90909090909090909090;
        drawEverything(transformedMatrix, zoom);
    }
})

function strisnumber(str){
    if(str.length === 0){
        return false;
    }
    if(str.charAt(str.length-1) == '.' || str.charAt(0) == '.'){
        return false;
    }
    if(str.charAt(0) == '-' && str.length === 1){
        return false;
    }
    if(str.charAt(0) == '-' && str.length > 0 && str.charAt(1) == '.'){
        return false;
    }
    var pointOK = false;
    for(i = 0; i < str.length; i++){

        if(str.charAt(i) == '-' && i !== 0){
            return false;
        }

        if(str.charAt(i) == '.'){
            if(pointOK){
                return false;
            }
            pointOK = true;
            continue;
        }

        if(str.charAt(i) != '0' && str.charAt(i) != '1'  && str.charAt(i) != '2'
        && str.charAt(i) != '3' && str.charAt(i) != '4' && str.charAt(i) != '5'
        && str.charAt(i) != '6' && str.charAt(i) != '7' && str.charAt(i) != '8'
        && str.charAt(i) != '9' && str.charAt(i) != '-'){
            return false;
        }
    }
    return true;
}

function strCanBeANumber(str){
    if(str.length === 0){
        return true;
    }
    if(str.charAt(0) == '-' && str.length > 0 && str.charAt(1) == '.'){
        return false;
    }
    var pointOK = false;
    for(i = 0; i < str.length; i++){

        if(str.charAt(i) == '-' && i !== 0){
            return false;
        }

        if(str.charAt(i) == '.'){
            if(pointOK){
                return false;
            }
            pointOK = true;
            continue;
        }

        if(str.charAt(i) != '0' && str.charAt(i) != '1'  && str.charAt(i) != '2'
        && str.charAt(i) != '3' && str.charAt(i) != '4' && str.charAt(i) != '5'
        && str.charAt(i) != '6' && str.charAt(i) != '7' && str.charAt(i) != '8'
        && str.charAt(i) != '9' && str.charAt(i) != '-'){
            return false;
        }
    }
    return true;
}

document.getElementById("x1").addEventListener('input', function () {
    elem = document.getElementById("x1").value;
    if(!strCanBeANumber(elem)){
        document.getElementById("x1").value = elem.substr(0, elem.length-1);
    }
    if(strisnumber(elem))
        newInput();
});
document.getElementById("x2").addEventListener('input', function (e) {
    elem = document.getElementById("x2").value;
    if(!strCanBeANumber(elem)){
        document.getElementById("x1").value = elem.substr(0, elem.length-1);
    }
    if(strisnumber(elem))
        newInput();
});
document.getElementById("y1").addEventListener('input', function () {
    elem = document.getElementById("y1").value;
    if(!strCanBeANumber(elem)){
        document.getElementById("x1").value = elem.substr(0, elem.length-1);
    }
    if(strisnumber(elem))
        newInput();
});
document.getElementById("y2").addEventListener('input', function () {
    elem = document.getElementById("y2").value;
    if(!strCanBeANumber(elem)){
        document.getElementById("x1").value = elem.substr(0, elem.length-1);
    }
    if(strisnumber(elem))
        newInput();
});

var matrix = [[1, 0], [0, 1]];
var toMatrix = matrix.slice();
var fromMatrix = matrix.slice();
var transformedMatrix = matrix.slice();
var zoom = 75; // Number of pixels per unit vector
var animationOn = false;
var dispCanonic = true;
var dispDetPlg = true;
var dispeigvect = true;
var projectCpEigvect = false;
var complexEigVect = false;
document.getElementById("dispCanonic").checked = dispCanonic;
document.getElementById("dispDetPlg").checked = dispDetPlg;
document.getElementById("dispeigvect").checked = dispeigvect;
document.getElementById("projectCpEigvect").checked = projectCpEigvect;

document.getElementById("thetaRange").value = 0;
document.getElementById("xRange").value = 1;
document.getElementById("yRange").value = 1;
document.getElementById("thetaValue").innerHTML = "&theta; = 0 &pi;";
document.getElementById("xStrVal").innerHTML = "x : 1";
document.getElementById("yStrVal").innerHTML = "y : 1";
document.getElementById("nbStepsRange").value = "2";
var lastTransform = ""; // Last transformation done (rotation, x-stretch, y-stretch)
var lastXStr = 1;
var lastYStr = 1;

// Returns the determinant of the matrix [[x1, y1], [x2, y2]]
function determinant(matrix){
    return matrix[0][0]*matrix[1][1] - (matrix[0][1]*matrix[1][0]);
}

// Inverts the matrix
function inv(matrix){
    m = 1/determinant(matrix);
    return [[m*matrix[1][1], -m*matrix[0][1]], [-m*matrix[1][0], m*matrix[0][0]]];
}

// Compute eigenvalues of A
function eigVal(A){
    D = determinant(A);     // det
    T = A[0][0] + A[1][1];  // trace
    delta = T*T/4-D;
    if (delta < 0){
        k = String(Math.sqrt(-delta));
        L1 = String(T/2) + "+" + k;
        L2 = String(T/2) + "-" + k;
        return [L1, L2];
    }
    else{
        k = Math.sqrt(delta);
        L1 = T/2 + k;
        L2 = T/2 - k;
        return [L1, L2];
    }
}

// Compute eigenvectors of A
function eigVect(A){
    L = eigVal(A);

    // Real eigenvalues
    if(typeof(L[0]) === "number"){
        complexEigVect = false;
        L1 = L[0];
        L2 = L[1];
        if(A[0][1] !== 0){
            v1 = [L1-A[1][1], A[0][1]];
            v2 = [L2-A[1][1], A[0][1]];
        }
        else if(A[1][0] !== 0){
            v1=[A[1][0], L1-A[0][0]];
            v2=[A[1][0], L2-A[0][0]];
        }
        else{
            return{v1:[1,0], v2:[0,1]};
        }
        // Normalization
        nV1 = Math.sqrt(v1[0]*v1[0] + v1[1] * v1[1]);
        v1[0]/=nV1;
        v1[1]/=nV1;
        nV2 = Math.sqrt(v2[0]*v2[0] + v2[1] * v2[1]);
        v2[0]/=nV2;
        v2[1]/=nV2;
        return{v1:v1, v2:v2};
    }

    // Complex eigenvalues
    else{
        complexEigVect = true;
        L1 = L[0].split('+');
        L2 = L[1].split('-');
        if(A[0][1] !== 0){
            v1 = [String(L1[0]-A[1][1]) + "+" + L1[1], String(A[0][1])+"+0"];
            v2 = [String(L2[0]-A[1][1]) + "-" + L2[1], String(A[0][1])+"-0"];
        }
        else if(A[1][0] !== 0){
            v1 = [String(A[1][0])+"+0", String(L1[0]-A[0][0]) + "+" + L1[1]];
            v2 = [String(A[1][0])+"-0", String(L2[0]-A[0][0]) + "-" + L2[1]];
        }
        else{
            return{v1:[1,0], v2:[0,1]};
        }
        // Normalization
        modV11 = mod(v1[0]); // v1[0] module
        modV12 = mod(v1[1]);
        modV21 = mod(v2[0]);
        modV22 = mod(v2[1]);
        nv1 = Math.sqrt(modV11 * modV11 + modV12 * modV12);
        nv2 = Math.sqrt(modV21 * modV21 + modV22 * modV22);
        v1[0] = divCplx(v1[0], nv1);
        v1[1] = divCplx(v1[1], nv1);
        v2[0] = divCplx(v2[0], nv2);
        v2[1] = divCplx(v2[1], nv2);
        return{v1:v1, v2:v2};
    }
}

// Split complex number string
function splitCplx(cplxStr){
    z = cplxStr.split('+');
    if (z.length === 1){
        z = cplxStr.split('-');
    }
    return z;
}

// Module of complex number as string
function mod(cplxString){
    z = cplxString.split('+');
    if (z.length === 1){
        z = cplxString.split('-');
    }
    re = Number(z[0]);
    im = Number(z[1]);
    return(Math.sqrt(re*re+im*im));
}

// Divide complex number string by real value
function divCplx(cplxStr, realval){
    z = cplxStr.split('+');
    if (z.length === 1){
        z = cplxStr.split('-');
        op = '-';
    }
    else{
        op = '+';
    }
    re = Number(z[0]) / realval;
    im = Number(z[1]) / realval;
    return String(re) + op + String(im);
}

// Invert current matrix and update display
function invertMat(){
    if(!animationOn){
        matrix =  inv(transformedMatrix);
        updateMatrixDisplay(matrix, 100);
    }
}

function random(){
    if(!animationOn){
        m = 8;
        matrix = [[m*Math.random()-4, m*Math.random()-4], [m*Math.random()-4, m*Math.random()-4]];
        updateMatrixDisplay(matrix, 100);
    }
}

function identity(){
    if(!animationOn){
        matrix = [[1,0],[0,1]];
        updateMatrixDisplay(matrix, 100);
    }
}

function newInput(){
    var x1 = document.getElementById("x1").value;
    var x2 = document.getElementById("x2").value;
    var y1 = document.getElementById("y1").value;
    var y2 = document.getElementById("y2").value;
    var inputmat = [[parseFloat(x1), parseFloat(y1)], [parseFloat(x2), parseFloat(y2)]];
    updateMatrixDisplay(inputmat, 100);
}

// Draws the line with vector director "vector" passing by the point "point" on the canvas
function drawLine(vector, point, color, lineWidth){
    // If vector is null, there's nothing to draw
    if(vector[0] === 0 && vector[1] === 0){
        return -1;
    }
    pt0 = null;
    pt1 = null;
    // Finding the intersection with the canvas borders
    if(vector[0] !== 0){
        a = -vector[1]/vector[0];
        b = point[1] - a*point[0];
        
        // Intersection with x = 0
        if (0 <= b && b<=canvas.height){
            pt0 = [0, b];
        }
        // Intersection with x = canvas.width
        if (0 <= a*canvas.width + b && a*canvas.width + b <= canvas.height){
            if(pt0 === null){
                pt0 = [canvas.width, a*canvas.width+b];
            }
            else{
                pt1 = [canvas.width, a*canvas.width+b];
            }
        }
        if(a!==0){
            // Intersection with y = 0
            if(0 <= -b/a && -b/a <= canvas.width){
                if(pt0 === null){
                    pt0 = [-b/a, 0];
                }
                else if(pt1 === null){
                    pt1 = [-b/a, 0];
                }
            }
            // Intersection with y = canvas.height
            if(0 <= (canvas.height-b)/a && (canvas.height-b)/a <= canvas.width){
                if(pt0 === null){
                    pt0 = [(canvas.height-b)/a, canvas.height];
                }
                else if(pt1 === null){
                    pt1 = [(canvas.height-b)/a, canvas.height];
                }
            }
        }
    }
    else{
        // if vector[0] === 0
        if(0 <= point[0] && point[0] <= canvas.width){
            pt0 = [point[0], 0];
            pt1 = [point[0], canvas.height];
        }
    }

    if(pt0 !== null && pt1 !== null){
        context.strokeStyle = color ? color : "#888888";
        context.lineWidth = lineWidth ? lineWidth : 1;
        context.beginPath();
        context.moveTo(pt0[0], pt0[1]);
        context.lineTo(pt1[0], pt1[1]);
        context.stroke();
        return 0;
    }
    else{
        // Return -1 if the points are not defined (unable to draw a line)
        return -1;
    }
}

// Draws the lines parallel to u1 = (x1, y1) of the matrix [[x1, y1], [x2, y2]]
// zoom is the zoom level (number of pixels per unit vector)
function drawXGrid(matrix, zoom, color, lineWidth){
    var origin = [canvas.width/2, canvas.height/2]; // Origin at the middle of the canvas
    var drawable = 0; // -1 if not drawable
    var dx = 0;
    var dy = 0;
    while(drawable !== -1){
        drawable = drawLine(matrix[0], origin, color, lineWidth)
        dx = (matrix[1][0])*zoom;
        dy = (matrix[1][1])*zoom;
        origin[0]+=dx*dx + dy*dy > 25 ? dx : 5*dx;
        origin[1]-=dx*dx + dy*dy > 25 ? dy : 5*dy;;
        if(Math.abs(determinant(matrix)) <= 0.1){
            drawable = -1;
        }
    }
    var origin = [canvas.width/2, canvas.height/2]; // Origin at the middle of the canvas
    var drawable = 0; // -1 if not drawable
    while(drawable !== -1){
        drawable = drawLine(matrix[0], origin, color, lineWidth)
        dx = (matrix[1][0])*zoom;
        dy = (matrix[1][1])*zoom;
        origin[0]-=dx*dx + dy*dy > 25 ? dx : 5*dx;
        origin[1]+=dx*dx + dy*dy > 25 ? dy : 5*dy;
        if(Math.abs(determinant(matrix)) <= 0.1){
            drawable = -1;
        }
    }
}

// Draws the lines parallel to u2 = (x2, y2) of the matrix [[x1, y1], [x2, y2]]
// zoom is the zoom level (number of pixels per unit vector)
function drawYGrid(matrix, zoom, color, lineWidth){
    var origin = [canvas.width/2, canvas.height/2]; // Origin at the middle of the canvas
    var drawable = 0; // -1 if not drawable
    while(drawable !== -1){
        drawable = drawLine(matrix[1], origin, color, lineWidth)
        origin[0]+=matrix[0][0]*zoom;
        origin[1]-=matrix[0][1]*zoom;
        if(Math.abs(determinant(matrix)) <= 0.1){
            drawable = -1;
        }
    }
    var origin = [canvas.width/2, canvas.height/2]; // Origin at the middle of the canvas
    var drawable = 0; // -1 if not drawable
    while(drawable !== -1){
        drawable = drawLine(matrix[1], origin, color, lineWidth)
        origin[0]-=matrix[0][0]*zoom;
        origin[1]+=matrix[0][1]*zoom;
        if(Math.abs(determinant(matrix)) <= 0.1){
            drawable = -1;
        }
    }
}

// Draws the x and y axis of the matrix [[x1, y1], [x2, y2]]
function drawAxis(matrix, color){
    drawLine(matrix[0], [canvas.width/2, canvas.height/2], color, 3);
    drawLine(matrix[1], [canvas.width/2, canvas.height/2], color, 3);
}

// Draws the grid of the matrix [[x1, y1], [x2, y2]]
// zoom is the zoom level (number of pixels per unit vector)
function drawGrid(matrix, zoom, color, lineWidth){
    context.strokeStyle = "#888888";
    context.lineWidth = 1;
    drawXGrid(matrix, zoom, color, lineWidth);
    drawYGrid(matrix, zoom, color, lineWidth);
}

// Draws the vector "vector" with the hexadecimal color "color"
// starting from the point "point"
// in the base "matrix" with the zoom "zoom"
function drawVector(matrix, vector, point, zoom, color){
    if(vector[0] !== 0 || vector[1] !== 0){
        context.strokeStyle  = color;
        context.fillStyle = color;
        context.lineWidth = 3;
        xfin = point[0]+(vector[0] * matrix[0][0] + vector[1] * matrix[1][0]) * zoom;
        yfin = point[1]-(vector[0] * matrix[0][1] + vector[1] * matrix[1][1])*zoom;
        context.beginPath();
        context.moveTo(point[0], point[1]);
        context.lineTo(xfin, yfin);
        context.stroke();
        context.beginPath();
        context.moveTo(xfin, yfin);
        var angle = Math.atan2(yfin-point[1], xfin-point[0]);
        var headlen = 15;
        context.lineTo(xfin - headlen * Math.cos(angle - Math.PI / 6), yfin - headlen * Math.sin(angle - Math.PI / 6));
        context.lineTo(xfin - headlen * Math.cos(angle + Math.PI / 6), yfin - headlen * Math.sin(angle + Math.PI / 6));
        context.lineTo(xfin, yfin);
        context.stroke();
        context.closePath();
        context.fill();
    }
}

// Draws the x and y base unit vector
function drawBaseVectors(matrix, zoom){
    origin = [canvas.width/2, canvas.height/2];
    drawVector(matrix, [0,1], origin, zoom, "#3BA356");
    drawVector(matrix, [1,0], origin, zoom, "#F12425");
}

// Draw eigenvectors
// k = 1 for current matrix eigenvectors
function drawVPVectors(zoom){
    if(dispeigvect){
        origin = [canvas.width/2, canvas.height/2];
        if(complexEigVect){
            if(projectCpEigvect){
                // Getting real part of v1 & v2
                let v1 = [Number(splitCplx(vp.v1[0])[0]), Number(splitCplx(vp.v1[1])[0])];
                let v2 = [Number(splitCplx(vp.v2[0])[0]), Number(splitCplx(vp.v2[1])[0])];
                // Draw orange
                drawVector(transformedMatrix, v1, origin, zoom, "#C17700");
                drawVector(transformedMatrix, v2, origin, zoom, "#E89814");
            }
        }
        else{
            // Draw purple
            drawVector(transformedMatrix, vp.v1, origin, zoom, "#C92AA4");
            drawVector(transformedMatrix, vp.v2, origin, zoom, "#A33A8A");
        }
    }
}

function drawDeterminant(matrix, zoom){
    context.fillStyle = "rgba(248, 230, 10, 0.6)";
    origin = [canvas.width/2, canvas.height/2];
    xfin = origin[0]+(matrix[0][0]) * zoom;
    yfin = origin[1]-(matrix[0][1]) * zoom;
    context.beginPath();
    context.moveTo(origin[0], origin[1]);
    context.lineTo(xfin, yfin);
    xfin = origin[0]+(matrix[0][0] + matrix[1][0]) * zoom;
    yfin = origin[1]-(matrix[0][1] + matrix[1][1]) * zoom;
    context.lineTo(xfin, yfin);
    xfin = origin[0]+(matrix[1][0]) * zoom;
    yfin = origin[1]-(matrix[1][1]) * zoom;
    context.lineTo(xfin, yfin);
    context.lineTo(origin[0], origin[1]);
    context.closePath();
    context.fill();
}

function drawCanonicBasis(zoom){
    origin = [canvas.width/2, canvas.height/2];
    drawVector([[1, 0], [0,1]], [1,0], origin, zoom, "rgba(52, 71, 71, 0.4)");
    drawVector([[1, 0], [0,1]], [0,1], origin, zoom, "rgba(22, 71, 71, 0.4)");
}

// Draws everything
// after having cleared the old stuff
function drawEverything(matrix, zoom){
    context.clearRect(0, 0, canvas.width, canvas.height);
    if(dispCanonic){
        drawGrid([[1,0],[0,1]], zoom, "#555555");
    }
    
    drawGrid(matrix, zoom, "#145360", 2);
    drawAxis(matrix, "#64A3B0");
    if(dispCanonic){
        drawCanonicBasis(zoom);
    }
    if(dispDetPlg){
        drawDeterminant(matrix, zoom);
    }
    drawVPVectors(zoom);
    drawBaseVectors(matrix, zoom);
    
}

function matrixGo(type){
    var x1 = document.getElementById("x1").value;
    var x2 = document.getElementById("x2").value;
    var y1 = document.getElementById("y1").value;
    var y2 = document.getElementById("y2").value;
    toMatrix = transformedMatrix.slice();
    matrix = toMatrix.slice();
    fromMatrix = [[matrix[0][0], matrix[0][1]],[matrix[1][0], matrix[1][1]]];
    toMatrix = [[parseFloat(x1), parseFloat(y1)], [parseFloat(x2), parseFloat(y2)]];
    // Return if there is no modification
    if(fromMatrix[0][0]-toMatrix[0][0] === 0 && fromMatrix[1][0]-toMatrix[1][0] === 0 &&
        fromMatrix[0][1]-toMatrix[0][1] === 0 && fromMatrix[1][1]-toMatrix[1][1] === 0){
        return;
    }
    valp = eigVal(toMatrix);
    vp = eigVect(toMatrix);
    vpFrom = eigVect(toMatrix);
    animationOn = true;
    i=0;
    document.getElementById("thetaRange").value = 0;
    document.getElementById("xRange").value = 1;
    document.getElementById("yRange").value = 1;
    document.getElementById("thetaValue").innerHTML = "&theta; = 0 &pi;";
    document.getElementById("xStrVal").innerHTML = "x : 1";
    document.getElementById("yStrVal").innerHTML = "y : 1";
    lastYStr = 1;
    lastXStr = 1;
    switch(type){
        case "Linear":
            var evol = evolMatrix(matrix, toMatrix, nbSteps);
            dx1 = evol.dx1;
            dx2=evol.dx2;
            dy1=evol.dy1;
            dy2=evol.dy2;
            //animate("Linear");
            break;
        case "Polynomial":
            animate();
    }
}

function updateMatrix(matrixFrom, matrixTo, step, totalNbSteps){
    let t = step/totalNbSteps;
    let k = 6*t*t*t*t*t-15*t*t*t*t+10*t*t*t;
    matrix[0][0] = matrixFrom[0][0] + k * (matrixTo[0][0] - matrixFrom[0][0]);
    matrix[1][0] = matrixFrom[1][0] + k * (matrixTo[1][0] - matrixFrom[1][0]);
    matrix[0][1] = matrixFrom[0][1] + k * (matrixTo[0][1] - matrixFrom[0][1]);
    matrix[1][1] = matrixFrom[1][1] + k * (matrixTo[1][1] - matrixFrom[1][1]);

    updateEigVect(vpFrom, k);
    updateMatrixDisplay(matrix, 100);
}

function updateMatrixDisplay(matrix, round){
    document.getElementById("x1").value = Math.round(round*matrix[0][0])/round;
    document.getElementById("y1").value = Math.round(round*matrix[0][1])/round;
    document.getElementById("x2").value = Math.round(round*matrix[1][0])/round;
    document.getElementById("y2").value = Math.round(round*matrix[1][1])/round;
    document.getElementById("detValue").innerHTML = Math.round(100*determinant(matrix))/100;

    // Display Eigenvalues
    valp = eigVal(matrix);
    let L = valp;
    // If real
    if(typeof(L[0]) === "number"){
        document.getElementById("L1").innerHTML = Math.round(100*L[0])/100;
        document.getElementById("L2").innerHTML = Math.round(100*L[1])/100;
    }
    // If complex
    else{
        document.getElementById("L1").innerHTML = String(Math.round(100*L[0].split('+')[0])/100) + 
                        " + " + String(Math.round(100*L[0].split('+')[1])/100) + "i";
        document.getElementById("L2").innerHTML = String(Math.round(100*L[1].split('-')[0])/100) + 
                        " + " + String(Math.round(100*L[1].split('-')[1])/100) + "i";
    }
    
    // Display Eigenvectors
    vp = eigVect(matrix);
    // If real
    if(typeof(vp.v1[0]) === 'number'){
        document.getElementById("V11").innerHTML = Math.round(100*vp.v1[0])/100;
        document.getElementById("V12").innerHTML = Math.round(100*vp.v1[1])/100;
        document.getElementById("V21").innerHTML = Math.round(100*vp.v2[0])/100;
        document.getElementById("V22").innerHTML = Math.round(100*vp.v2[1])/100;
    }
    // If complex
    else{
        document.getElementById("V11").innerHTML = String(Math.round(100*vp.v1[0].split('+')[0])/100) + 
                        " + " + String(Math.round(100*vp.v1[0].split('+')[1])/100) + "i";
        document.getElementById("V12").innerHTML = String(Math.round(100*vp.v1[1].split('+')[0])/100) + 
                        " + " + String(Math.round(100*vp.v1[1].split('+')[1])/100) + "i";
        document.getElementById("V21").innerHTML = String(Math.round(100*vp.v2[0].split('-')[0])/100) + 
                        " + " + String(Math.round(100*vp.v2[0].split('-')[1])/100) + "i";
        document.getElementById("V22").innerHTML = String(Math.round(100*vp.v2[1].split('-')[0])/100) + 
                        " + " + String(Math.round(100*vp.v2[1].split('-')[1])/100) + "i";
    }
}

function updateEigVect(vpFrom, k){
    vpTo0 = vpFrom[0] * valp[0];
    vpTo1 = vpFrom[1] * valp[1];
    vp[0] = vpFrom[0] + k*(vpTo0 - vpFrom[0]);
    vp[1] = vpFrom[1] + k*(vpTo1 - vpFrom[1]);
}

function updateThetaDisplay(value){
    // Rotates the graph of theta radians and refresh HTML value
    document.getElementById("thetaValue").innerHTML = "&theta; = " + value + " &pi;";
    rotateMatrix(Math.PI*value);  
}

function updateXDisplay(value){
    // Updates the graph in function of the X-Stretch value
    document.getElementById("xStrVal").innerHTML = "x : " + value;
    stretchX(value);
}

function updateYDisplay(value){
    // Updates the graph in function of the Y-Stretch value
    document.getElementById("yStrVal").innerHTML = "y : " + value;
    stretchY(value);
}

function rotateMatrix(theta){
    if(lastTransform !== "rot"){
        matrix = transformedMatrix.slice();
        lastYStr = document.getElementById("yRange").value;
        lastXStr = document.getElementById("xRange").value;
    }
    transformedMatrix = [[0,0],[0,0]];
    transformedMatrix[0][0] = Math.cos(theta)*matrix[0][0] - Math.sin(theta)*matrix[0][1];
    transformedMatrix[0][1] = Math.sin(theta)*matrix[0][0] + Math.cos(theta)*matrix[0][1];
    transformedMatrix[1][0] = Math.cos(theta)*matrix[1][0] - Math.sin(theta)*matrix[1][1];
    transformedMatrix[1][1] = Math.sin(theta)*matrix[1][0] + Math.cos(theta)*matrix[1][1];
    vpFrom = eigVect(transformedMatrix);
    valp = eigVal(transformedMatrix);
    vp = eigVect(transformedMatrix);
    updateMatrixDisplay(transformedMatrix, 100);
    drawEverything(transformedMatrix, zoom);
    lastTransform = "rot";
}

function stretchX(xStr){
    // Stretches the X vector of the matrix by the amount xStr
    if(lastTransform !== "x-str"){
        matrix = transformedMatrix.slice();
        lastYStr = document.getElementById("yRange").value;
    }
    transformedMatrix = [[0,0],matrix[1]];
    transformedMatrix[0][0] = matrix[0][0] * xStr / lastXStr;
    transformedMatrix[0][1] = matrix[0][1] * xStr / lastXStr;
    vpFrom = eigVect(transformedMatrix);
    valp = eigVal(transformedMatrix);
    vp = eigVect(transformedMatrix);
    updateMatrixDisplay(transformedMatrix, 100);
    drawEverything(transformedMatrix, zoom);
    lastTransform = "x-str";
}

function stretchY(yStr){
    // Stretches the Y vector of the matrix by the amount yStr
    lastXStr = document.getElementById("xRange").value;
    oldRatio = 1;
    if(lastTransform !== "y-str"){
        matrix = transformedMatrix.slice();
    }
    transformedMatrix = [matrix[0], [0,0]];
    transformedMatrix[1][0] = matrix[1][0] * yStr / lastYStr;
    transformedMatrix[1][1] = matrix[1][1] * yStr / lastYStr;
    vpFrom = eigVect(transformedMatrix);
    valp = eigVal(transformedMatrix);
    vp = eigVect(transformedMatrix);

    updateMatrixDisplay(transformedMatrix, 100);
    drawEverything(transformedMatrix, zoom);
    lastTransform = "y-str";
}

function changeAnimationDuration(duration){
    // Changes the animation duration via nbSteps and refreshes HTML
    nbSteps = Math.ceil(50*duration);
    document.getElementById("animDuration").innerHTML = duration + " s";
}

function dispCanonic(){
    dispCanonic = !dispCanonic;
    drawEverything(matrix, zoom);
}

valp = eigVal(matrix);
vp = eigVect(matrix);
vpFrom = eigVect(matrix);
dx1=0.1;
dy1=0.1;
dx2=0.1;
dy2=0.1;
nbSteps = 60;
changeAnimationDuration(document.getElementById("nbStepsRange").value);

drawEverything(matrix, zoom);
var i = 0;
function animate(){
    if(animationOn){
        setTimeout(() => {
            requestAnimationFrame(animate)
        }, 1000/60); // Run at 60 fps maximum
        updateMatrix(fromMatrix, toMatrix, i, nbSteps);
        drawEverything(matrix, zoom);
        i++;
    }
    if(i>nbSteps){
        drawEverything(toMatrix, zoom);
        matrix[0][0] = toMatrix[0][0];
        matrix[1][0] = toMatrix[1][0];
        matrix[1][1] = toMatrix[1][1];
        matrix[0][1] = toMatrix[0][1];
        animationOn = false;
        updateMatrixDisplay(matrix, 100);
    }
}
