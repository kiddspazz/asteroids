function rotate(point, d) {
  const angle = d * (Math.PI / 180);
  const newPoint = { x: 0, y: 0 };
  newPoint.x = (point.x * (Math.cos(angle)) - point.y * (Math.sin(angle)));
  newPoint.y = (point.y * (Math.cos(angle)) + point.x * (Math.sin(angle)));
  return newPoint;
}
