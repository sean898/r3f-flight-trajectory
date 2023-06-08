import * as THREE from 'three';
import {useCallback, useEffect, useState, useMemo, useRef} from 'react';
import {Line, useBounds} from '@react-three/drei';
import {Box3} from 'three';
import PropTypes from 'prop-types';

const defaultColor = [0.5, 0.6, 0.9];
const defaultColorObj = new THREE.Color(...defaultColor);
function chooseColors(n, segmentInfo, baseColor) {
    if (n < 2) return null;
    let colors = new Array();
    let pointIndex = 0;
    segmentInfo.forEach(({start, end, color}, i) => {
        if (pointIndex < start) {
            colors.push(...Array(start - pointIndex).fill(baseColor));
        }
        colors.push(...Array(end - start).fill(color));
        pointIndex = end;
    });
    if (pointIndex < n) colors.push(...Array(n - pointIndex).fill(baseColor));

    return colors;
}

let box = new Box3();
const range = 30;

/** The flight path */
function Path({
    coords,
    onHover,
    onClick,
    segmentInfo,
    followMode,
    index,
    color,
}) {
    const colorObj = useMemo(() => {
        return new THREE.Color(color);
    }, [color]);
    const colors = useMemo(() => {
        return coords == null || coords.length == 0
            ? []
            : chooseColors(coords.length, segmentInfo, colorObj);
    }, [coords, segmentInfo, colorObj]);
    const hoverCallback = useCallback(
        (e) => {
            e.stopPropagation();
            onHover(e.intersections[0].faceIndex, index);
        },
        [followMode]
    );

    const hoverOffCallback = useCallback((e) => {
        e.stopPropagation();
        onHover(null, index);
    });

    const clickCallback = useCallback((e) => {
        e.stopPropagation();
        onClick(e.intersections[0].faceIndex, index);
    }, []);

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
                onPointerLeave={hoverOffCallback}
                onDoubleClick={onDoubleClick}
                onClick={clickCallback}
            />
        </mesh>
    );
}

Path.propTypes = {
    /** Coordinates Vector3 */
    coords: PropTypes.array,

    /** Function for hovering on path line */
    onHover: PropTypes.func,

    /** Function for clicking on path line */
    onClick: PropTypes.func,

    /** Segment info containing 'start', 'end', 'color' fields */
    segmentInfo: PropTypes.array,

    /** Follow mode enabled */
    followMode: PropTypes.bool,

    /** Index of traces drawn. */
    index: PropTypes.number,

    /** Color for trace */
    color: PropTypes.string,
};

Path.defaultProps = {
    coords: [],
    segmentInfo: [],
    followMode: false,
    color: 'lightblue',
};

export {Path};
