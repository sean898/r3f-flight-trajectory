import {Plane, Segments} from '@react-three/drei';
import {memo} from 'react';
import {LineSegments} from 'three';

/** Draw a plane representing bottom of the 3D area. */
function RealBoundingPlane({bounds}) {
    if (bounds == null || bounds.length === 0) return <></>;
    const mesh = 10;
    const xRange = bounds[0][1] - bounds[0][0];
    const yRange = bounds[1][1] - bounds[1][0];
    const zRange = bounds[2][1] - bounds[2][0];
    return (
        <>
            <gridHelper
                args={[xRange, 10, 'red']}
                position={[-xRange / 2, 0, 0]}
            />
            <gridHelper
                args={[yRange, 10, 'green']}
                position={[-xRange / 2, 0, 0]}
                rotation-x={Math.PI / 2}
            />
            <gridHelper args={[zRange, 10, 'blue']} rotation-z={Math.PI / 2} />
            {/* <Plane
                position={[
                    bounds[0][0] + xRange / 2,
                    bounds[2][0],
                    bounds[1][0] + yRange / 2,
                ]}
                rotation-x={Math.PI / 2}
                args={[xRange, bounds[1][1] - bounds[1][0], mesh, mesh]}
            >
                <meshPhongMaterial wireframe color="white" />
            </Plane> */}
        </>
    );
}

export const BoundingPlane = memo(RealBoundingPlane);
