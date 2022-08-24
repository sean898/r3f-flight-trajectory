import * as THREE from 'three';
import {useCallback, useEffect, useState, useMemo, useRef} from 'react';
import {Point, Points, Line, PointMaterial, useHelper} from '@react-three/drei';
import {Box3} from 'three';

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

const defaultColor = [0.7, 0.7, 0.9];
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

export function Path({coords, onHover, segmentInfo, ...props}) {
    const colors = useMemo(
        () => (coords == null ? [] : chooseColors(coords.length, segmentInfo)),
        [coords.length, segmentInfo]
    );
    const callback = useCallback(
        (e) => {
            e.stopPropagation();
            onHover(e.index);
        },
        [onHover]
    );

    if (coords == null || coords.length == 0) return <></>;

    return (
        <mesh>
            <Line
                points={coords}
                lineWidth={2}
                vertexColors={colors}
                color={new THREE.Color(...defaultColor)}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    onHover(e.intersections[0].faceIndex);
                }}
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
