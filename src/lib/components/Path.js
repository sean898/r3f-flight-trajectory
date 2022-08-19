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

export function Path({coords, color, onHover}) {
    const points = useMemo(
        () => coords.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
        [coords]
    );
    const callback = useCallback(onHover);
    if (coords == null || coords.length == 0) return <></>;

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return (
        <>
            <Line points={points} lineWidth={3} color={'lightBlue'} />
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
