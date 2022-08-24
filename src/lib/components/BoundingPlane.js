import {Plane, Segments, Segment} from '@react-three/drei';
import {memo, useRef} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import {BackSide, Box3, FrontSide, LineSegments, Vector3} from 'three';

/** Version of numpy.arange */
function arange(start, stop, step) {
    const values = new Array();
    while (start <= stop) {
        values.push(start);
        start += step;
    }
    return values;
}

function axisArange(minValue, maxValue, interval) {
    return [
        ...arange(0, maxValue, interval),
        ...arange(minValue, 0 - interval, interval),
    ];
}

/** Draw a plane representing bottom of the 3D area. */
function RealBoundingPlane({bounds}) {
    const {camera} = useThree();
    const xzGrid = useRef();

    useFrame(() => {
        if (camera != null && xzGrid.current != null) {
            console.log('above', camera.position.y > 0);
            xzGrid.current.visible = camera.position.y > 0;
            // camera.layers.disable(1);
        }
    });

    if (bounds == null) return <></>;

    console.log('camera?', camera);
    const width = bounds.max.x - bounds.min.x;
    const height = bounds.max.y - bounds.min.y;
    const center = new Vector3();
    bounds.getCenter(center);

    function xGrid(interval = 100, layer = 1) {
        const elements = new Array();
        const zValues = axisArange(bounds.min.z, bounds.max.z, interval);
        zValues.forEach((z) => {
            elements.push(
                <Segment
                    start={[bounds.min.x, 0, z]}
                    end={[bounds.max.x, 0, z]}
                    color="lightgray"
                    key={`z-${z}`}
                    layers={[layer]}
                />
            );
        });
        axisArange(bounds.min.x, bounds.max.x, interval).forEach((x) => {
            elements.push(
                <Segment
                    start={[x, 0, bounds.min.z]}
                    end={[x, 0, bounds.max.z]}
                    color="lightgray"
                    key={`x-${x}`}
                    layers={[layer]}
                />
            );
        });

        return elements;
    }

    return (
        <>
            {/* <Plane
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
            </Plane> */}
            <Segments ref={xzGrid}>{xGrid()}</Segments>
        </>
    );
}

// export const BoundingPlane = memo(RealBoundingPlane);
export const BoundingPlane = RealBoundingPlane;
