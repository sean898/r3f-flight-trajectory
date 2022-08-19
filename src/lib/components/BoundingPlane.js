import {Plane} from '@react-three/drei';
import {memo} from 'react';

/** Draw a plane representing bottom of the 3D area. */
function RealBoundingPlane({bounds}) {
    if (bounds == null || bounds.length === 0) return <></>;
    const mesh = 10;
    const xRange = bounds[0][1] - bounds[0][0];
    const yRange = bounds[1][1] - bounds[1][0];
    console.log('bounds', bounds);
    return (
        <Plane
            position={[
                bounds[0][0] + xRange / 2,
                bounds[2][0],
                bounds[1][0] + yRange / 2,
            ]}
            rotation-x={Math.PI / 2}
            args={[xRange, bounds[1][1] - bounds[1][0], mesh, mesh]}
        >
            <meshPhongMaterial wireframe color="white" />
        </Plane>
    );
}

export const BoundingPlane = memo(RealBoundingPlane);
