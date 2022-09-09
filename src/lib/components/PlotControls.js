import {useCallback, useEffect, useState} from 'react';
import {Html, useBounds} from '@react-three/drei';
import {useFrame, useThree} from '@react-three/fiber';
import {MathUtils, Vector3} from 'three';
import {initialCameraPosition} from './FlightPath.react';
import {getCoordinates} from '../util';
import PropTypes from 'prop-types';
import { equals, damp, pointBetween } from '../util/vectors';

const origin = new Vector3(0, 0, 0);
const damping = 7
const eps =  10

/** Controls for the plot */
function PlotControls({
    currentData,
    controlsRef, 
    followMode,
    toggleFollowMode,
    ...props
}) {
    const [current] = useState({
        animating: false,
        dragging: false,
        camera: new Vector3(),
        focus: new Vector3(),
    })
    const [goal] = useState({
        camera: new Vector3(),
        focus: new Vector3(),
        targetDiff: new Vector3()
    })
    const {camera, invalidate} = useThree()
    const snapCallback = useCallback((e) => {
        e.stopPropagation();
        snapToAircraft();
    });
    const resetCallback = useCallback((e) => {
        console.log(initialCameraPosition, origin, camera.position);
        e.stopPropagation();
        setCamera(initialCameraPosition, origin);
    });

    useEffect(() => {
        const callback = (e) => {
            current.dragging = true
        }
        const callbackEnd = (e) => {
            current.dragging = false
            
        }
        controlsRef.current.addEventListener('start', callback)
        controlsRef.current.addEventListener('end', callbackEnd)
        return () => {
            controlsRef.current.removeEventListener('start', callback)
            controlsRef.current.removeEventListener('end', callbackEnd)
        }
    }, [controlsRef.current])

    useFrame((state, delta) => {
        console.log('animating', current.animating)
        if (followMode && current.animating) {
            // current.focus.lerp(goal.focus, delta)
            // current.camera.lerp(goal.camera, delta)
            damp(current.focus, goal.focus, damping, delta)
            if (!current.dragging) {
                damp(current.camera, goal.camera, damping, delta)
                camera.position.copy(current.camera)
                camera.updateProjectionMatrix()
            } else {
                current.camera.copy(state.camera.position)
            }
            controlsRef.current.target.copy(current.focus)
            controlsRef.current.update()

            invalidate()
            if (!equals(camera.position, goal.camera, eps)) return
            if (!equals(current.focus, goal.focus, eps)) return
            current.animating = false
        }
    })

    function setCamera(position, target) {
        camera.position.set(position.x, position.y, position.z);
        controlsRef.current.target.copy(target);
        controlsRef.current.update();
    }

    function snapToAircraft(alpha = 0.9, ...args) {
        setGoal()
        camera.position.lerp(goal.camera, alpha);
        controlsRef.current.target.copy(goal.focus);
        controlsRef.current.update();
    }

    function setGoal() {
        const aircraftPosition = getCoordinates(currentData);
        goal.targetDiff.copy(current.focus
            .clone()
            .sub(aircraftPosition)
            .normalize())

        goal.camera.copy(pointBetween(aircraftPosition.addScaledVector(goal.targetDiff, 10), camera.position, 200))
        goal.focus.copy(aircraftPosition);
        current.animating = true;
    }

    useEffect(() => {
        if (followMode) {
            setGoal()
        }
    }, [currentData])

    return (
        <Html
            wrapperClass="plot-controls-wrapper"
            className="plot-controls"
            transform={false}
            center={false}
            fullScreen
            onOcclude={() => {}} /* don't occlude */
        >
            <button onClick={resetCallback}>Reset</button>
            <button onClick={snapCallback}>Snap</button>
            <button onClick={toggleFollowMode} className={followMode ? 'selected' : ''}>Follow</button>
        </Html>
    );
}

PlotControls.propTypes = {
    // Data of current point
    currentData: PropTypes.object,

    /** Reference to controls object */
    controlsRef: PropTypes.any,

    /** Follow mode enabled */
    followMode: PropTypes.bool,

    /** Callback to toggle follow mode */
    toggleFollowMode: PropTypes.func,
};

export {PlotControls};
