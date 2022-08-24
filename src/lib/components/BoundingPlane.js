import {Plane, Segments, Segment} from '@react-three/drei';
import {memo, useRef} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import {BackSide, Box3, FrontSide, LineSegments, Vector3} from 'three';

/** Version of numpy.arange */
function arange(start, stop, step) {
    const values = new Array();
    while (start < stop) {
        values.push(start);
        start += step;
    }
    return values;
}

function axisArange(minValue, maxValue, interval) {
    return [
        ...arange(0, maxValue, interval),
        ...arange(minValue, 0 - interval, interval),
        maxValue,
    ];
}

/** Draw a plane representing bottom of the 3D area. */
function RealBoundingPlane({bounds}) {
    const {camera} = useThree();
    const xzGrid = useRef();

    useFrame(() => {
        if (camera != null && xzGrid.current != null) {
            xzGrid.current.visible = camera.position.y > bounds.min.y;
        }
    });

    if (bounds == null) return <></>;

    const width = bounds.max.x - bounds.min.x;
    const height = bounds.max.y - bounds.min.y;
    const center = new Vector3();
    bounds.getCenter(center);

    function xGrid(interval = 10000) {
        const elements = new Array();
        const zValues = axisArange(bounds.min.z, bounds.max.z, interval);
        zValues.forEach((z) => {
            elements.push(
                <Segment
                    start={[bounds.min.x, bounds.min.y, z]}
                    end={[bounds.max.x, bounds.min.y, z]}
                    color="lightgray"
                    key={`z-${z}`}
                />
            );
        });
        axisArange(bounds.min.x, bounds.max.x, interval).forEach((x) => {
            elements.push(
                <Segment
                    start={[x, bounds.min.y, bounds.min.z]}
                    end={[x, bounds.min.y, bounds.max.z]}
                    color="lightgray"
                    key={`x-${x}`}
                />
            );
        });

        return elements;
    }

    return (
        <>
            <Segments ref={xzGrid}>{xGrid()}</Segments>
        </>
    );
}

// export const BoundingPlane = memo(RealBoundingPlane);
export const BoundingPlane = RealBoundingPlane;
