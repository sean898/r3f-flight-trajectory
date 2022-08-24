import {Plane, Segments, Segment} from '@react-three/drei';
import {memo} from 'react';
import {BackSide, Box3, FrontSide, LineSegments, Vector3} from 'three';

/** Draw a plane representing bottom of the 3D area. */
function RealBoundingPlane({bounds}) {
    if (bounds == null) return <></>;

    const width = bounds.max.x - bounds.min.x;
    const height = bounds.max.y - bounds.min.y;
    const center = new Vector3();
    bounds.getCenter(center);

    return (
        <>
            <Plane
                args={[width, bounds.max.z - bounds.min.z]}
                position={[center.x, 0, center.z]}
                rotation-x={Math.PI / 2}
            >
                <meshBasicMaterial color="gray" side={BackSide} opacity={0.5} />
            </Plane>
            <Segments>
                <Segment
                    start={[bounds.min.x, 0, 0]}
                    end={[bounds.max.x, 0, 0]}
                    color="red"
                />
            </Segments>
        </>
    );
}

// export const BoundingPlane = memo(RealBoundingPlane);
export const BoundingPlane = RealBoundingPlane;
