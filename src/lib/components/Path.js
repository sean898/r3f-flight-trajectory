import * as THREE from 'three';
import {useCallback, useEffect, useState, useMemo, useRef} from 'react';
import {
    Point,
    Points,
    Line,
    PointMaterial,
    useHelper,
    useBounds,
} from '@react-three/drei';
import {Box3} from 'three';
import PropTypes from 'prop-types';

// function FlightPoint({index, onHover, ...props}) {
//     const [hovered, setHover] = useState(false);
//     return (
//         <Point
//             {...props}
//             color={hovered ? 'red' : 'blue'}
//             onPointerOver={(e) => {
//                 e.stopPropagation();
//                 onHover(index);
//                 setHover(true);
//             }}
//             onPointerOut={(e) => {
//                 e.stopPropagation();
//                 setHover(false);
//             }}
//         />
//     );
// }

const defaultColor = [0.5, 0.6, 0.9];
const defaultColorObj = new THREE.Color(...defaultColor);
function chooseColors(n, segmentInfo) {
    if (n < 2) return null;
    let colors = new Array();
    let pointIndex = 0;
    segmentInfo.forEach(({start, end, color}, i) => {
        if (pointIndex < start) {
            colors.push(...Array(start - pointIndex).fill(defaultColor));
        }
        colors.push(...Array(end - start).fill(color));
        pointIndex = end;
    });
    if (pointIndex < n)
        colors.push(...Array(n - pointIndex).fill(defaultColor));

    return colors;
}

let box = new Box3();
const range = 30;

/** The flight path */
function Path({coords, onHover, segmentInfo, followMode}) {
    const colors = useMemo(
        () => (coords == null ? [] : chooseColors(coords.length, segmentInfo)),
        [coords.length, segmentInfo]
    );
    const hoverCallback = useCallback(
        (e) => {
            if (followMode) return {};
            e.stopPropagation();
            onHover(e.intersections[0].faceIndex);
        },
        [followMode]
    );
    const ref = useRef();
    const bounds = useBounds();
    useEffect(() => {
        if (bounds != null && ref.current != null)
            bounds.refresh(ref.current).fit();
    }, [coords]);

    function onDoubleClick(e) {
        const index = e.intersections[0].faceIndex;
        const startIndex = Math.max(index - range, 0);
        const endIndex = Math.min(index + range, coords.length);
        box = box.setFromPoints([coords[startIndex], coords[endIndex]]);
        bounds.refresh(box).fit();
    }

    console.log('coords', coords);
    if (coords == null || coords.length == 0) return <></>;

    return (
        <mesh>
            <Line
                ref={ref}
                points={coords}
                lineWidth={2}
                vertexColors={colors}
                color={defaultColorObj}
                onPointerMove={hoverCallback}
                onDoubleClick={onDoubleClick}
            />
            {/* <Points limit={coords.length}>
                <PointMaterial vertexColors size={0.8} />
                {coords.map((position, i) => (
                    <Point
                        key={i}
                        position={position}
                        // onPointerOver={callback}
                        color={'blue'}
                    />
                ))}
            </Points> */}
            {/* <boxHelper args={[ref.current, 'blue']} opacity={0.3} /> */}
        </mesh>
    );
}

Path.propTypes = {
    /** Coordinates Vector3 */
    coords: PropTypes.array,

    /** Function for hovering on path line */
    onHover: PropTypes.func,

    /** Segment info */
    segmentInfo: PropTypes.array,

    /** Follow mode enabled */
    followMode: PropTypes.bool,
};

Path.defaultProps = {
    coords: [],
    segmentInfo: [],
    followMode: false,
};

export {Path};
