import * as THREE from 'three';
import {useCallback, useEffect, useState, useMemo} from 'react';
import {Point, Points, Line, PointMaterial} from '@react-three/drei';

function FlightPoint({index, onHover, ...props}) {
    const [hovered, setHover] = useState(false);
    return (
        <Point
            {...props}
            color={hovered ? 'red' : 'blue'}
            onPointerOver={(e) => {
                e.stopPropagation();
                onHover(index);
                setHover(true);
            }}
            onPointerOut={(e) => {
                e.stopPropagation();
                setHover(false);
            }}
        />
    );
}

const defaultColor = [30, 30, 0];
const colorPalette = [
    [250, 0, 0],
    [0, 250, 0],
    [0, 0, 250],
];
function chooseColors(n, segmentInfo) {
    if (n < 2) return null;
    console.log(n, segmentInfo);
    let colors = new Array();
    let pointIndex = 0;
    segmentInfo.forEach(({start, end}, i) => {
        if (pointIndex < start) {
            colors.push(...Array(start - pointIndex).fill(defaultColor));
        }
        colors.push(
            ...Array(end - start).fill(colorPalette[i % colorPalette.length])
        );
        pointIndex = end;
    });
    if (pointIndex < n)
        colors.push(...Array(n - pointIndex + 1).fill(defaultColor));

    console.log('colors', colors);
    return colors;
}

export function Path({coords, onHover, segmentInfo, ...props}) {
    const colors = useMemo(
        () => (coords == null ? [] : chooseColors(coords.length, segmentInfo)),
        [coords.length, segmentInfo]
    );
    const points = useMemo(
        () => coords.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
        [coords]
    );
    const callback = useCallback(onHover, []);
    if (coords == null || coords.length == 0 || points === undefined)
        return <></>;

    return (
        <>
            <Line points={points} lineWidth={1} vertexColors={colors} />
            <Points>
                <PointMaterial vertexColors size={0.5} />
                {points.map((position, i) => (
                    <FlightPoint
                        key={i}
                        index={i}
                        position={position}
                        onHover={callback}
                    />
                ))}
            </Points>
        </>
    );
}
