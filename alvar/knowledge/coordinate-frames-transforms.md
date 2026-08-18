---
topic: coordinate-frames-transforms
mastery: UNDERSTOOD
last_tested: 2026-08-18
---

# Coordinate Frames & Transforms

- Body frame: fixed to drone, sensors like IMU report here
- World frame: fixed to Earth, GPS reports here
- Transform: world_point = R × body_point + position
- R = rotation matrix (or quaternion), position = translation
- When drone rotates, body frame rotates with it — "forward" changes direction in world frame
- All sensor data must be transformed to a common frame before fusion
