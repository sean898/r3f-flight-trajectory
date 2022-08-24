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

    function xGrid(interval = 100) {
        const elements = new Array();
        let z_position = 0;
        while (z_position <= bounds.max.z) {
            console.log(z_position);
            elements.push(
                <Segment
                    start={[bounds.min.x, 0, z_position]}
                    end={[bounds.max.x, 0, z_position]}
                    color="lightgray"
                    key={`z-${z_position}`}
                />
            );
            z_position += interval;
        }
        return <>{elements}</>;
    }

    return (
        <>
            <Plane
                args={[width, bounds.max.z - bounds.min.z]}
                position={[center.x, 0, center.z]}
                rotation-x={Math.PI / 2}
            >
                <meshBasicMaterial
                    color="gray"
                    side={BackSide}
                    polygonOffset
                    polygonOffsetFactor={1}
                />
            </Plane>
            <Segments>{xGrid()}</Segments>
        </>
    );
}

// export const BoundingPlane = memo(RealBoundingPlane);
export const BoundingPlane = memo(RealBoundingPlane);
