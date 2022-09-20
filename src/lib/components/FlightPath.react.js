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
import {useRef, Suspense, useState, useEffect, createRef} from 'react';
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
const FlightPath = ({
    id,
    data,
    counter,
    segmentInfo,
    modelFile,
    playing,
    playbackSpeed,
    setProps,
    hoverData,
    clickData,
}) => {
    const [hoverIndex, setHoverIndex] = useState(null);
    const [coords, setCoords] = useState(null);
    const [bounds, setBounds] = useState(null);
    const [followMode, setFollowMode] = useState(false);
    const [viewDistance, setViewDistance] = useState(150000);
    const [traceIndex, setTraceIndex] = useState(0);
    const [hoverTraceIndex, setHoverTraceIndex] = useState(0);

    const controlsRef = useRef();
    const aircraftRefs = useRef([]);

    function toggleFollowMode() {
        setFollowMode(!followMode);
    }

    function getOutputData(timeIndex, traceIndex) {
        return {
            data: data[traceIndex][timeIndex],
            traceIndex: traceIndex,
            timeIndex: timeIndex,
        };
    }

    function onTraceHover(timeIndex, traceIndex) {
        setHoverIndex(timeIndex);
        setHoverTraceIndex(traceIndex);
        if (setProps) {
            setProps({
                hoverData: getOutputData(timeIndex, traceIndex),
            });
        }
    }

    function onTraceClick(timeIndex, traceIndex) {
        setTraceIndex(traceIndex);
        if (setProps)
            setProps({clickData: getOutputData(timeIndex, traceIndex)});
    }

    useEffect(() => {
        if (data != null) {
            setCoords(
                data.map((traceData) =>
                    traceData.map((d) => new Vector3(d.x, d.y, d.z))
                )
            );
        }
    }, [data]);

    useEffect(() => {
        if (coords != null && coords.length) {
            const bbox = new Box3().setFromPoints(coords.flat(1));
            setBounds(bbox);
        }
    }, [coords]);

    useEffect(() => {
        if (bounds != null) {
            setViewDistance(
                Math.max(
                    Math.abs(bounds.max.x - bounds.min.x),
                    Math.abs(bounds.max.y - bounds.min.y),
                    Math.abs(bounds.max.z - bounds.min.z)
                ) * viewDistanceFactor
            );
        }
    }, [bounds]);

    /** Reference:
     *  https://stackoverflow.com/questions/54633690/how-can-i-use-multiple-refs-for-an-array-of-elements-with-hooks/ */
    if (coords != null && aircraftRefs.current.length !== coords.length) {
        aircraftRefs.current = Array(coords.length)
            .fill()
            .map((_, i) => aircraftRefs.current[i] || createRef());
    }
    const traces =
        data == null || coords == null ? (
            <></>
        ) : (
            [...Array(data.length).keys()].map((i) => {
                return (
                    <group key={`trace-${i}`}>
                        <Path
                            coords={coords[i]}
                            color={'lightblue'}
                            onHover={onTraceHover}
                            onClick={onTraceClick}
                            segmentInfo={segmentInfo}
                            followMode={followMode}
                            key={`path-${i}`}
                            index={i}
                        />
                        <Suspense key={`suspense-${i}`} fallback={null}>
                            <Aircraft
                                positionData={data[i][counter]}
                                modelFile={modelFile}
                                playing={playing}
                                playbackSpeed={playbackSpeed}
                                aircraftRef={aircraftRefs.current[i]}
                                index={i}
                                color={i === 0 ? 'green' : 'orange'}
                                key={`aircraft-${i}`}
                            />
                        </Suspense>
                    </group>
                );
            })
        );

    if (coords == null || coords.length == 0)
        return (
            <>
                <p>No data</p>
            </>
        );
    return (
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
            <Bounds fit={true} clip={false} damping={6} margin={1.2}>
                {traces}
                <PlotControls
                    followMode={followMode}
                    toggleFollowMode={toggleFollowMode}
                    currentData={data[traceIndex][counter]} // todo
                    controlsRef={controlsRef}
                    playing={playing}
                    aircraftRef={aircraftRefs.current[traceIndex]}
                />
            </Bounds>
            <HoverInfo
                data={data[hoverTraceIndex][hoverIndex]}
                fields={hoverInfoFields}
            />
            <Legend segmentInfo={segmentInfo} />
            {/* <Stats /> */}
        </Canvas>
    );
};
FlightPath.defaultProps = {
    data: [],
    counter: 0,
    segmentInfo: [],
    playbackSpeed: 1000,
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

    /** Set to true to animate playback. */
    playing: PropTypes.bool,

    /** Playback speed in ms. Value should be synchronized with interval component which updates counter. */
    playbackSpeed: PropTypes.number,

    /** Prop on hover */
    hoverData: PropTypes.object,

    /** Updated on click */
    clickData: PropTypes.object,
};

export default FlightPath;
