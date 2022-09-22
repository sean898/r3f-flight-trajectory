import {useState, useCallback, useEffect} from 'react';
import {Html} from '@react-three/drei';
import {useFrame, useThree} from '@react-three/fiber';
import {Vector3} from 'three';
import {initialCameraPosition} from './FlightPath.react';
import {getCoordinates} from '../util';
import PropTypes from 'prop-types';

const origin = new Vector3(0, 0, 0);

function pointBetween(p0, p1, dist) {
    const direction = p1.clone().sub(p0).normalize().multiplyScalar(dist);
    return p0.clone().add(direction);
}

/** Controls for the plot */
function PlotControls({
    currentData,
    controlsRef,
    aircraftRef,
    followMode,
    toggleFollowMode,
    playing,
    ...props
}) {
    const camera = useThree((state) => state.camera);
    const [goalPosition, setGoalPosition] = useState(new Vector3());
    const [dragging, setDragging] = useState(false);

    function setCamera(position, target) {
        camera.position.set(position.x, position.y, position.z);
        controlsRef.current.target.copy(target);
        controlsRef.current.update();
    }

    function setGoal() {
        if (currentData == null) return;
        const aircraftPosition = getCoordinates(currentData);
        const targetDiff = aircraftPosition
            .clone()
            .sub(controlsRef.current.target);
        const goal = pointBetween(aircraftPosition, camera.position, 200).add(
            targetDiff
        );
        setGoalPosition(goal);
    }

    useEffect(() => {
        if (playing && followMode && controlsRef.current != null) {
            controlsRef.current.update();
            setGoal();
        }
    }, [controlsRef.current, followMode, currentData]);

    useFrame((state, delta) => {
        if (aircraftRef != null) {
            if (playing && followMode && !dragging) {
                camera.position.lerp(goalPosition, delta);
            }
            controlsRef.current.target.copy(aircraftRef.current.position);
            controlsRef.current.update();
        }
    });

    /** Prevent drag hijacking */
    useEffect(() => {
        const callbackStart = (e) => {
            setDragging(true);
        };
        const callbackEnd = (e) => {
            setDragging(false);
            controlsRef.current.update();
        };

        controlsRef.current.addEventListener('start', callbackStart);
        controlsRef.current.addEventListener('end', callbackEnd);
        return () => {
            controlsRef.current.removeEventListener('start', callbackStart);
            controlsRef.current.removeEventListener('end', callbackEnd);
        };
    }, [controlsRef.current]);

    return <></>;
}

PlotControls.propTypes = {
    // Data of current point
    currentData: PropTypes.object,

    /** Reference to controls object */
    controlsRef: PropTypes.any,

    /** Reference to aircraft object */
    aircraftRef: PropTypes.any,

    /** Follow mode enabled */
    followMode: PropTypes.bool,

    /** Callback to toggle follow mode */
    toggleFollowMode: PropTypes.func,

    /** Whether playback is ongoing */
    playing: PropTypes.bool,
};

export {PlotControls};
