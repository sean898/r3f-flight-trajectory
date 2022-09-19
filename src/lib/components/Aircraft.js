import {useGLTF} from '@react-three/drei';
import {useRef, useMemo, useEffect, useState, useLayoutEffect} from 'react';
import {degreesToRadians} from '../util';
import {useThree} from '@react-three/fiber';
import PropTypes from 'prop-types';
import {Euler, Vector3} from 'three';
import {vectorEquals} from '../util/vectors';
import {useSpring, animated} from '@react-spring/three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const headingOffset = -120;
const minModelScale = 0.6;
const maxModelScale = 30;
let scale, xRot, yRot, zRot;
let euler = new Euler();

/** Aircraft model */
export default function Aircraft({
    positionData,
    modelFile,
    playing,
    playbackSpeed,
    aircraftRef,
    index,
    color,
    ...otherProps
}) {
    const modelRef = useRef();
    const {camera} = useThree();
    const [{scene, materials}, setModel] = useState({scene: null, materials: null})

    useLayoutEffect(() => {
        new GLTFLoader().load(modelFile, setModel)
    }, [modelFile])

    const [{springPosition}, api] = useSpring(
        {
            springPosition: new Vector3(),
            config: {duration: playbackSpeed},
        },
        []
    );

    useMemo(() => {
        if (modelFile && modelFile.endsWith('F-16.glb') && materials != null && materials['Material.002'] != null)
            materials['Material.002'].color.set(color);
    }, [index, color, materials]);

    useEffect(() => {
        if (aircraftRef.current != null && positionData != null) {
            const {x, y, z, heading, pitch, bank} = positionData;

            /* Position */
            if (playing) {
                api.start({
                    from: {springPosition: [...aircraftRef.current.position]},
                    springPosition: [x, y, z],
                    config: {duration: playbackSpeed},
                });
            } else {
                aircraftRef.current.position.set(x, y, z);
            }

            /* Rotation */
            yRot = (heading + headingOffset) * degreesToRadians;
            zRot = pitch * degreesToRadians;
            xRot = bank * degreesToRadians;
            euler.set(xRot, yRot, zRot, 'XYZ');
            aircraftRef.current.setRotationFromEuler(euler);

            /* Scale */
            const distance = camera.position.distanceTo(
                aircraftRef.current.position
            );
            if (distance > 10000) {
                scale = maxModelScale;
            } else if (distance > 5000) {
                scale = maxModelScale / 2;
            } else {
                scale = minModelScale;
            }
            if (scale && modelRef.current != null && scale != modelRef.current.scale) {
                modelRef.current.scale.set(scale, scale, scale);
                modelRef.current.updateMatrix();
            }
        }
    }, [playing, positionData, playbackSpeed]);

    return (
        <animated.group ref={aircraftRef} position={springPosition}>
            {scene ? <primitive
                ref={modelRef}
                object={scene}
                scale={minModelScale}
                {...otherProps}
            /> : <></>}
            <axesHelper args={[20]} setColors={['red', 'green', 'blue']} />
        </animated.group>
    );
}

Aircraft.propTypes = {
    /** Current position */
    positionData: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
        z: PropTypes.number,
        heading: PropTypes.number,
        pitch: PropTypes.number,
        bank: PropTypes.number,
    }),
    /** Path to aircraft model file (gltf/glb) */
    modelFile: PropTypes.string,

    /** Whether playback is active. */
    playing: PropTypes.bool,

    /** Interval in milliseconds */
    playbackSpeed: PropTypes.number,

    /** Reference to aircraft, created in parent. */
    aircraftRef: PropTypes.any,

    /** Color to use for aircraft model */
    color: PropTypes.any,

    /** Index of aircraft in scene */
    index: PropTypes.number,
};
