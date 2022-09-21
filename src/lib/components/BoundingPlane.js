import {Segments, Segment} from '@react-three/drei';
import {useRef, memo} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import {Vector3} from 'three';
import PropTypes from 'prop-types';

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
    const xyGrid = useRef();

    useFrame(() => {
        if (camera != null && xyGrid.current != null) {
            xyGrid.current.visible = camera.position.z > bounds.min.z;
        }
    });

    if (bounds == null) return <></>;

    const center = new Vector3();
    bounds.getCenter(center);

    function xGrid(interval = 10000) {
        const elements = new Array();
        const yValues = axisArange(bounds.min.y, bounds.max.y, interval);
        yValues.forEach((y) => {
            elements.push(
                <Segment
                    start={[bounds.min.x, y, bounds.min.z]}
                    end={[bounds.max.x, y, bounds.min.z]}
                    color="lightgray"
                    key={`y-${y}`}
                />
            );
        });
        axisArange(bounds.min.x, bounds.max.x, interval).forEach((x) => {
            elements.push(
                <Segment
                    start={[x, bounds.min.y, bounds.min.z]}
                    end={[x, bounds.max.y, bounds.min.z]}
                    color="lightgray"
                    key={`x-${x}`}
                />
            );
        });

        return elements;
    }

    return (
        <>
            <Segments ref={xyGrid}>{xGrid()}</Segments>
        </>
    );
}

RealBoundingPlane.propTypes = {
    //** Box3 object bounding plot data */
    bounds: PropTypes.any,
};

RealBoundingPlane.defaultProps = {
    bounds: null,
};

export const BoundingPlane = memo(RealBoundingPlane);
// export const BoundingPlane = RealBoundingPlane;
