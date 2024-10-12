<?php

class AreaUnderCurve
{
  private $coefficients;
  private $xInit;
  private $xEnd;

  public function __construct($coefficients, $xInit, $xEnd)
  {
    $this->coefficients = $coefficients;
    $this->xInit = $xInit;
    $this->xEnd = $xEnd;
  }

  // Polynomial equation
  private function equation($x)
  {
    list($a, $b, $c, $d, $e, $f, $g) = $this->coefficients;
    return
      floatval($a) * pow($x, 6) +
      floatval($b) * pow($x, 5) +
      floatval($c) * pow($x, 4) -
      floatval($d) * pow($x, 3) +
      floatval($e) * pow($x, 2) -
      floatval($f) * $x +
      floatval($g);
  }

  // Method to find intersections
  private function findIntersections($xInit, $xEnd, $tolerance)
  {
    $intersections = [];
    $step = ($xEnd - $xInit) / 1000;
    for ($currentX = $xInit; $currentX < $xEnd; $currentX += $step) {
      $functionAtXa = $this->equation($currentX);
      $functionAtXb = $this->equation($currentX + $step);
      if ($functionAtXa * $functionAtXb <= 0) {
        $intersection = $this->bisectionMethod($currentX, $currentX + $step, $tolerance);
        $intersections[] = $intersection;
      }
    }
    return $intersections;
  }

  // Bisection to find the root
  private function bisectionMethod($xInit, $xEnd, $tolerance)
  {
    $midpointX = $xInit;
    while (($xEnd - $xInit) / 2.0 > $tolerance) {
      $midpointX = ($xInit + $xEnd) / 2.0;
      $functionAtMidpointX = $this->equation($midpointX);
      if ($functionAtMidpointX == 0.0) break;
      elseif ($this->equation($xInit) * $functionAtMidpointX < 0) {
        $xEnd = $midpointX;
      } else {
        $xInit = $midpointX;
      }
    }
    return $midpointX;
  }

  // Areas by Gauss-Legendre
  private function gaussLegendre($xInit, $xEnd)
  {
    $x = [-1.0 / sqrt(3), 1.0 / sqrt(3)];
    $w = [1.0, 1.0];
    $c1 = ($xEnd - $xInit) / 2.0;
    $c2 = ($xEnd + $xInit) / 2.0;
    $integral = 0.0;
    for ($i = 0; $i < count($x); $i++) {
      $integral += $w[$i] * $this->equation($c1 * $x[$i] + $c2);
    }
    return $c1 * $integral;
  }

  // Areas by trapezoidal
  private function trapezoidalRule($xInit, $xEnd, $intervals)
  {
    $intervalLength = ($xEnd - $xInit) / $intervals;
    $accumulates = 0.5 * ($this->equation($xInit) + $this->equation($xEnd));
    for ($i = 1; $i < $intervals; $i++) {
      $valX = $xInit + $i * $intervalLength;
      $accumulates += $this->equation($valX);
    }
    return $accumulates * $intervalLength;
  }

  // Areas by Riemann sum
  private function riemannSum($xInit, $xEnd, $intervals)
  {
    $intervalLength = ($xEnd - $xInit) / $intervals;
    $accumulates = 0.0;
    for ($i = 0; $i < $intervals; $i++) {
      $valX = $xInit + $i * $intervalLength;
      $accumulates += $this->equation($valX) * $intervalLength;
    }
    return $accumulates;
  }

  // Area by Simpson rule
  private function simpsonRule($xInit, $xEnd, $intervals)
  {
    $intervalLength = ($xEnd - $xInit) / $intervals;
    $accumulates = $this->equation($xInit) + $this->equation($xEnd);
    for ($i = 1; $i < $intervals; $i++) {
      $valX = $xInit + $i * $intervalLength;
      $accumulates += $i % 2 === 0 ? 2 * $this->equation($valX) : 4 * $this->equation($valX);
    }
    return ($intervalLength / 3) * $accumulates;
  }

  // Print areas to HTML
  public function printAreas()
  {
    $startTime1 = microtime(true);
    $cuts = $this->findIntersections($this->xInit, $this->xEnd, 0.001);
    $totalArea1 = 0;
    $totalArea2 = 0;
    $aPoint = $this->xInit;
    $bPoint = $this->xInit;

    foreach ($cuts as $i => $cut) {
      $bPoint = $cut;
      $gaussArea = abs($this->gaussLegendre($aPoint, $bPoint));
      $trapezoidalArea = abs($this->trapezoidalRule($aPoint, $bPoint, 10000));
      $riemannArea = abs($this->riemannSum($aPoint, $bPoint, 10000));
      $simpsonArea = abs($this->simpsonRule($aPoint, $bPoint, 10000));
      $averageArea = ($gaussArea + $trapezoidalArea + $riemannArea + $simpsonArea) / 4;
      $totalArea1 += $averageArea;

      $endTime1 = microtime(true);
      $totalTime1 = $endTime1 - $startTime1;

      echo "<script>
              document.getElementById('areaPHP1').innerHTML = $totalArea1.toFixed(4);
              document.getElementById('timePHP1').innerHTML = " . ($totalTime1) . ".toFixed(4);
            </script>";

      $aPoint = $bPoint;
    }

    $gaussArea = abs($this->gaussLegendre($bPoint, $this->xEnd));
    $trapezoidalArea = abs($this->trapezoidalRule($bPoint, $this->xEnd, 10000));
    $riemannArea = abs($this->riemannSum($bPoint, $this->xEnd, 10000));
    $simpsonArea = abs($this->simpsonRule($bPoint, $this->xEnd, 10000));
    $averageArea = ($gaussArea + $trapezoidalArea + $riemannArea + $simpsonArea) / 4;
    $totalArea2 += $averageArea;

    $endTime2 = microtime(true);
    $totalTime2 = $endTime2 - $startTime1;
    $totalAreaPHP = $totalArea1 + $totalArea2;


    echo number_format($totalArea2, 2);
    echo "<script>
            document.getElementById('areaPHP2').innerHTML = $totalArea2.toFixed(4);
            document.getElementById('timePHP2').innerHTML = " . ($endTime2 - $startTime1) . ".toFixed(4);
            document.getElementById('totalAreaPHP').innerHTML = ($totalAreaPHP).toFixed(4);
            document.getElementById('totalTimePHP').innerHTML = ($totalTime2).toFixed(4);
          </script>";
  }
}

// Use the Class with coefficients and extremes
$coefficients = [0.1, 0.6, -0.7, -5.7, 2, 4, 3];
$xInit = -7;
$xEnd = 7;
$areaCalc = new AreaUnderCurve($coefficients, $xInit, $xEnd);
$areaCalc->printAreas();
