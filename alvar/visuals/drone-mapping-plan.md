# Real-Time Drone Mapping & Position Update Plan

Here is our learning path. We have completed **Coordinate Frames & Transforms**. Today, we are moving to **Sensors: What Each One Actually Gives You**.

```mermaid
graph TD
    A[Coordinate Frames & Transforms] style A fill:#90EE90,stroke:#333,stroke-width:2px
    B[Sensors: What Each One Actually Gives You] style B fill:#FFD700,stroke:#333,stroke-width:2px
    C[Sensor Fusion — EKF/UKF]
    D[SLAM — Simultaneous Localization & Mapping]
    E[Real-Time Mapping Pipeline]
    F[Position Update Loop]
    G[Jetson Orin Software Stack — ROS2 + Libraries]
    H[Aerothon Build Plan]

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
```
