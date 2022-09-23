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
import {Box3, Object3D, Vector3} from 'three';
import Aircraft from './Aircraft';
import {PlotControls} from './PlotControls';
import {BoundingPlane} from './BoundingPlane';
import {Path} from './Path';
import {HoverInfo} from './HoverInfo';
import {Legend} from './Legend';

Object3D.DefaultUp = new Vector3(0, 0, 1);
export const initialCameraPosition = new Vector3(0, 0, 100);

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
    hoverInfoFields,
    traceTitles,
    headingOffset,
}) => {
    const [hoverIndex, setHoverIndex] = useState(null);
    const [coords, setCoords] = useState(null);
    const [bounds, setBounds] = useState(null);
    const [followMode, setFollowMode] = useState(false);
    const [viewDistance, setViewDistance] = useState(150000);
    const [targetTraceIndex, setTargetTraceIndex] = useState(0);
    const [hoverTraceIndex, setHoverTraceIndex] = useState(0);

    const controlsRef = useRef();
    const aircraftRefs = useRef([]);

    function toggleFollowMode() {
        setFollowMode(!followMode);
    }

    function getOutputData(timeIndex, traceIndex) {
        return {
            data: data?.[traceIndex]?.[timeIndex],
            traceIndex: traceIndex,
            timeIndex: timeIndex,
            traceTitle: traceTitles && traceTitles[traceIndex],
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
        // setTargetTraceIndex(traceIndex);
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
                            segmentInfo={segmentInfo[i]}
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
                                headingOffset={headingOffset}
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
        <div id={id} className="flight-trajectory-plot">
            <div className="flight-trajectory-plot-inner">
                <Canvas
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
                    <spotLight
                        position={[9, 10, 10]}
                        angle={0.15}
                        penumbra={1}
                    />
                    <pointLight position={[-11, -10, -10]} />
                    <Bounds fit={true} clip={false} damping={6} margin={1.2}>
                        {traces}
                        <PlotControls
                            followMode={followMode}
                            toggleFollowMode={toggleFollowMode}
                            currentData={
                                targetTraceIndex == null
                                    ? null
                                    : data[targetTraceIndex][counter]
                            } // todo
                            controlsRef={controlsRef}
                            playing={playing}
                            aircraftRef={
                                targetTraceIndex == null
                                    ? null
                                    : aircraftRefs.current[targetTraceIndex]
                            }
                        />
                    </Bounds>
                    <HoverInfo
                        data={data[hoverTraceIndex][hoverIndex]}
                        fields={hoverInfoFields}
                        traceTitle={traceTitles[hoverTraceIndex]}
                        segmentInfo={segmentInfo[hoverTraceIndex]}
                        timeIndex={hoverIndex}
                    />
                    {/* <Stats /> */}
                </Canvas>
                <div
                    className="plot-controls"
                    style={{position: 'absolute', top: 0, left: 0}}
                >
                    <button
                        onClick={toggleFollowMode}
                        className={followMode ? 'active' : ''}
                    >
                        Follow
                    </button>
                </div>
                <Legend
                    segmentInfo={segmentInfo}
                    traceTitles={traceTitles}
                    currentTraceIndex={targetTraceIndex}
                    setCurrentTraceIndex={(index) =>
                        setTargetTraceIndex(
                            index === targetTraceIndex ? null : index
                        )
                    }
                />
            </div>
        </div>
    );
};
FlightPath.defaultProps = {
    data: [],
    counter: 0,
    segmentInfo: [],
    playbackSpeed: 1000,
    headingOffset: 0,
    hoverInfoFields: [
        'x',
        'y',
        'z',
        'alt',
        'ralt',
        'heading',
        'bank',
        'pitch',
        'wow',
    ],
    traceTitles: [],
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

    /** Fields in data to show in hover info */
    hoverInfoFields: PropTypes.array,

    /** Names of traces, ordered as data */
    traceTitles: PropTypes.array,

    /** Degrees to offset heading rotation of aircraft model */
    headingOffset: PropTypes.number,
};

export default FlightPath;
