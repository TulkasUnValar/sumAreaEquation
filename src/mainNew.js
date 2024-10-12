/* Mauricio Quiñones Díaz. Tulkas */
console.log("Mauricio Quiñones Díaz (Tulkas)");
let totalTimeJS1 = 0;
class AreaUnderCurve {
  constructor(coefficients, xInit, xEnd) {
    this.coefficients = coefficients;
    this.xInit = xInit;
    this.xEnd = xEnd;
  }

  // Polynomial equation
  equation(x) {
    const [a, b, c, d, e, f, g] = this.coefficients;
    return (
      parseFloat(a) * Math.pow(x, 6) +
      parseFloat(b) * Math.pow(x, 5) +
      parseFloat(c) * Math.pow(x, 4) -
      parseFloat(d) * Math.pow(x, 3) +
      parseFloat(e) * Math.pow(x, 2) -
      parseFloat(f) * x +
      parseFloat(g)
    );
  }

  // Method to find intersections
  findIntersections(xInit, xEnd, tolerance) {
    let intersections = [];
    let step = (xEnd - xInit) / 1000;
    for (let currentX = xInit; currentX < xEnd; currentX += step) {
      let functionAtXa = this.equation(currentX);
      let functionAtXb = this.equation(currentX + step);
      if (functionAtXa * functionAtXb <= 0) {
        let intersection = this.bisectionMethod(
          currentX,
          currentX + step,
          tolerance
        );
        intersections.push(intersection);
      }
    }
    return intersections;
  }

  // Bisection to find the root
  bisectionMethod(xInit, xEnd, tolerance) {
    let midpointX = xInit;
    while ((xEnd - xInit) / 2.0 > tolerance) {
      midpointX = (xInit + xEnd) / 2.0;
      let functionAtMidpointX = this.equation(midpointX);
      if (functionAtMidpointX === 0.0) break;
      else if (this.equation(xInit) * functionAtMidpointX < 0) {
        xEnd = midpointX;
      } else {
        xInit = midpointX;
      }
    }
    return midpointX;
  }

  // Areas by Gauss-Legendre
  gaussLegendre(xInit, xEnd) {
    const x = [-1.0 / Math.sqrt(3), 1.0 / Math.sqrt(3)];
    const w = [1.0, 1.0];
    let c1 = (xEnd - xInit) / 2.0;
    let c2 = (xEnd + xInit) / 2.0;
    let integral = 0.0;
    for (let i = 0; i < x.length; i++) {
      integral += w[i] * this.equation(c1 * x[i] + c2);
    }
    return c1 * integral;
  }

  // Areas by trapezoidal
  trapezoidalRule(xInit, xEnd, intervals) {
    let intervalLength = (xEnd - xInit) / intervals;
    let accumulates = 0.5 * (this.equation(xInit) + this.equation(xEnd));
    for (let i = 1; i < intervals; i++) {
      let valX = xInit + i * intervalLength;
      accumulates += this.equation(valX);
    }
    return accumulates * intervalLength;
  }

  // Areas by Riemann´s sum
  riemannSum(xInit, xEnd, intervals) {
    let intervalLength = (xEnd - xInit) / intervals;
    let accumulates = 0.0;
    for (let i = 0; i < intervals; i++) {
      let valX = xInit + i * intervalLength;
      accumulates += this.equation(valX) * intervalLength;
    }
    return accumulates;
  }

  // Area by Simpson rule
  simpsonRule(xInit, xEnd, intervals) {
    const intervalLength = (xEnd - xInit) / intervals;
    let accumulates = this.equation(xInit) + this.equation(xEnd);
    for (let i = 1; i < intervals; i++) {
      let valX = xInit + i * intervalLength;
      accumulates +=
        i % 2 === 0 ? 2 * this.equation(valX) : 4 * this.equation(valX);
    }
    return (intervalLength / 3) * accumulates;
  }

  // Print areas to HTML
  printAreas() {
    let startTime1 = new Date().getTime();
    let startTime2 = new Date().getTime();

    let cuts = this.findIntersections(this.xInit, this.xEnd, 0.001);
    let totalArea1 = 0,
      totalArea2 = 0;
    let aPoint = this.xInit,
      bPoint = this.xInit;

    for (let i = 0; i < cuts.length; i++) {
      bPoint = cuts[i];
      let gaussArea = Math.abs(this.gaussLegendre(aPoint, bPoint));
      let trapezoidalArea = Math.abs(
        this.trapezoidalRule(aPoint, bPoint, 10000)
      );
      let riemannArea = Math.abs(this.riemannSum(aPoint, bPoint, 10000));
      let simpsonArea = Math.abs(this.simpsonRule(aPoint, bPoint, 10000));
      let averageArea =
        (gaussArea + trapezoidalArea + riemannArea + simpsonArea) / 4;
      totalArea1 += averageArea;

      document.getElementById("cutP11").innerHTML = aPoint.toFixed(4);
      document.getElementById("cutP12").innerHTML = bPoint.toFixed(4);
      document.getElementById("areaJS1").innerHTML = totalArea1.toFixed(4);
      let endTime1 = new Date().getTime();
      totalTimeJS1 = endTime1 - startTime1;
      document.getElementById("timeJS1").innerHTML = totalTimeJS1;

      aPoint = bPoint;
    }

    let gaussArea = Math.abs(this.gaussLegendre(bPoint, this.xEnd));
    let trapezoidalArea = Math.abs(
      this.trapezoidalRule(bPoint, this.xEnd, 10000)
    );
    let riemannArea = Math.abs(this.riemannSum(bPoint, this.xEnd, 10000));
    let simpsonArea = Math.abs(this.simpsonRule(bPoint, this.xEnd, 10000));
    let averageArea =
      (gaussArea + trapezoidalArea + riemannArea + simpsonArea) / 4;
    totalArea2 += averageArea;

    document.getElementById("cutP21").innerHTML = bPoint.toFixed(4);
    document.getElementById("cutP22").innerHTML = this.xEnd.toFixed(4);
    document.getElementById("areaJS2").innerHTML = totalArea2.toFixed(4);
    let endTime2 = new Date().getTime();
    let totalTimeJS2 = endTime2 - startTime2;
    document.getElementById("timeJS2").innerHTML = totalTimeJS2;

    document.getElementById("totalAreaJS").innerHTML = (
      totalArea1 + totalArea2
    ).toFixed(4);
    document.getElementById("totalTimeJS").innerHTML =
      totalTimeJS1 + totalTimeJS2;
  }
}

// Use the Class with coefficients and extremes
const coefficients = [0.1, 0.6, -0.7, -5.7, 2, 4, 3];
const xInit = -7,
  xEnd = 7;
const areaCalc = new AreaUnderCurve(coefficients, xInit, xEnd);

// Event
document.getElementById("btnCalArea").addEventListener("click", () => {
  areaCalc.printAreas();
});

// Refresh buttom
document.getElementById("refresh").addEventListener("click", () => {
  location.reload();
});
