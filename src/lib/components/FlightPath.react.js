/**
 * TODO
 * - https://threejs.org/docs/#examples/en/utils/CameraUtils.frameCorners
 *
 */
import PropTypes from 'prop-types';
/* eslint no-magic-numbers: 0 */
import {
    OrbitControls,
    PerspectiveCamera,
    Stats,
    Bounds,
} from '@react-three/drei';
import {useRef, Suspense, useState, useEffect, useMemo} from 'react';
import {Canvas, useFrame} from '@react-three/fiber';
import {Box3, Vector3} from 'three';
import Aircraft from './Aircraft';
import {PlotControls} from './PlotControls';
import {BoundingPlane} from './BoundingPlane';
import {Path} from './Path';
import {HoverInfo} from './HoverInfo';
import {Legend} from './Legend';

export const initialCameraPosition = new Vector3(0, 0, 100);

const hoverInfoFields = [
    'x',
    'y',
    'z',
    'alt',
    'ralt',
    'heading',
    'bank',
    'pitch',
    'wow',
];
const viewDistanceFactor = 3;

/** 3D flight trjaectory plot  */
const FlightPath = ({id, data, counter, segmentInfo, modelFile}) => {
    const [hoverIndex, setHoverIndex] = useState(null);
    const [followMode, setFollowMode] = useState(false);

    function toggleFollowMode() {
        setFollowMode(!followMode);
    }

    const [coords, bounds, viewDistance] = useMemo(() => {
        console.log('memo miss');
        console.log('data', data);
        if (data == null) return [null, null, null];
        const coordinates = data.map((a) =>
            a.map((d) => new Vector3(d.x, d.y, d.z))
        );
        const bbox = new Box3().setFromPoints(coordinates.flat(1));
        const viewDist =
            Math.max(
                Math.abs(bbox.max.x - bbox.min.x),
                Math.abs(bbox.max.y - bbox.min.y),
                Math.abs(bbox.max.z - bbox.min.z)
            ) * viewDistanceFactor;
        return [coordinates, bbox, viewDist];
    }, [data]);

    const controlsRef = useRef();
    if (coords == null || coords.length == 0)
        return (
            <>
                <p>No data</p>
            </>
        );

    // const currentData = data.length > -1 ? data[counter % data.length] : {};
    const traceIndex = 0;
    let currentData;
    console.log(coords, 'cooords');
    return (
        <>
            <Canvas
                id={id}
                className="flight-trajectory-plot"
                raycaster={{
                    params: {
                        Line2: {threshold: 3},
                        Line: {threshold: 3},
                    },
                }}
            >
                <PerspectiveCamera
                    makeDefault
                    position={initialCameraPosition}
                    far={viewDistance}
                    minDistance={10}
                />
                <OrbitControls
                    makeDefault
                    zoomSpeed="2"
                    maxDistance={viewDistance * 0.8}
                    ref={controlsRef}
                    enableDamping
                    dampingFactor={0.05}
                />
                <BoundingPlane bounds={bounds} />
                <ambientLight color={0xffffff} />
                <spotLight position={[9, 10, 10]} angle={0.15} penumbra={1} />
                <pointLight position={[-11, -10, -10]} />
                <Bounds clip={false} damping={6} margin={1.2}>
                    {data == null || coords == null ? (
                        <></>
                    ) : (
                        data.map((traceData, i) => {
                            currentData = traceData[counter];
                            console.log(i, currentData);
                            return (
                                <group key={`trace-${i}`}>
                                    <Path
                                        coords={coords[i]}
                                        color={'lightblue'}
                                        onHover={setHoverIndex}
                                        segmentInfo={segmentInfo}
                                        followMode={followMode}
                                    />
                                    <Suspense fallback={null}>
                                        <Aircraft
                                            positionData={currentData}
                                            modelFile={modelFile}
                                        />
                                    </Suspense>
                                </group>
                            );
                        })
                    )}
                    <PlotControls
                        followMode={followMode}
                        toggleFollowMode={toggleFollowMode}
                        currentData={data[traceIndex][counter]} // todo set with traceIndex
                        controlsRef={controlsRef}
                    />
                </Bounds>
                <HoverInfo
                    data={data[traceIndex][hoverIndex]}
                    fields={hoverInfoFields}
                />
                <Legend segmentInfo={segmentInfo} />
                {/* <Stats /> */}
            </Canvas>
        </>
    );
};
FlightPath.defaultProps = {
    data: [],
    counter: 0,
    segmentInfo: [],
};

FlightPath.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string,

    /**
     * Data containing flight trajectory coordinates and flight parameters.:w
     */
    data: PropTypes.array,

    /** Segment info */
    segmentInfo: PropTypes.array,
    /** Numeric index into data */
    counter: PropTypes.number,
    /**
     * Dash-assigned callback that should be called to report property changes
     * to Dash, to make them available for callbacks.
     */
    setProps: PropTypes.func,

    /** Path to aircraft model file (gltf/glb) */
    modelFile: PropTypes.string,
};

export default FlightPath;
