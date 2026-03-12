# Convex_Hull_Visualizer
visualizes Divide and Conquer algorithm, Convex Hull - Graham Scan, with time complexity analysis.

1. Point Generation

When the user clicks “New Points”, the program generates a set of random points inside the canvas area. Each point has an x-coordinate, y-coordinate, and a unique ID. These points represent the dataset from which the convex hull will be computed.

2. Finding the Starting Point (P₀)

The algorithm first identifies the starting point P₀, which is the point with the lowest y-coordinate. If two points share the same y-coordinate, the one with the smaller x-coordinate is selected.
This point serves as the reference point for sorting all other points.

3. Polar Angle Sorting

After selecting P₀, all other points are sorted based on their polar angle relative to P₀. The sorting is performed using the cross product calculation, which determines the relative orientation of points.
If two points have the same angle, the point closer to P₀ is placed first.

Sorting arranges the points in counterclockwise order, which is necessary for the scanning step of the Graham Scan algorithm.

4. Graham Scan (Hull Construction)

The sorted points are processed one by one to build the convex hull. A stack structure is used to maintain the current hull points.

For each new point:

The algorithm checks the orientation of the last two points in the stack and the current point.

This orientation is determined using the cross product.

The rules applied are:

Counter-clockwise turn (CCW): The point is part of the hull and is added to the stack.

Clockwise turn (CW): The previous point is removed from the stack since it does not belong to the convex boundary.

This process continues until all points have been processed.

5. Convex Hull Visualization

After scanning all points, the stack contains the final convex hull points. These points are connected to form the convex polygon that encloses all the points.

The visualization shows:

Generated points on the canvas

The current point being processed

Points currently in the hull

The final convex hull boundary

6. Interactive Controls

The visualizer provides several controls to help users understand the algorithm:

New Points: Generates a new random set of points.

Start Graham Scan: Begins the algorithm animation.

Pause: Temporarily stops the animation.

Step: Executes the algorithm one step at a time.

Reset: Clears the current process and resets the visualization.

Point Slider: Adjusts the number of points displayed.

7. Time Complexity

The overall time complexity of the Graham Scan algorithm is:

O(n log n)

This complexity arises from:

Finding P₀: O(n)

Sorting points by polar angle: O(n log n)

Scanning points to construct the hull: O(n)
