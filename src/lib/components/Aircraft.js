import {useGLTF} from '@react-three/drei';
import {useRef, useMemo, useEffect} from 'react';
import {degreesToRadians} from '../util';
import {useThree} from '@react-three/fiber';
import PropTypes from 'prop-types';

const headingOffset = -120;
const minModelScale = 0.6;
const maxModelScale = 30;
const color = 'green';
let scale;

/** Aircraft model */
export default function Aircraft({positionData, ...otherProps}) {
    const ref = useRef();
    const modelRef = useRef();
    const {camera} = useThree();
    const model = useGLTF('/public/F-16.glb', false);
    useMemo(() => {
        model.materials['Material.002'].color.set(color);
    }, [color]);

    useEffect(() => {
        if (positionData != null) {
            /* Position */
            const {x, y, z, heading, pitch, bank} = positionData;
            ref.current.position.set(x, y, z);

            /* Rotation */
            ref.current.rotation.y =
                (heading + headingOffset) * degreesToRadians;
            ref.current.rotation.z = pitch * degreesToRadians;
            ref.current.rotation.x = bank * degreesToRadians;

            /* Scale */
            const distance = camera.position.distanceTo(ref.current.position);
            if (distance > 10000) {
                scale = maxModelScale;
            } else if (distance > 5000) {
                scale = maxModelScale / 2;
            } else {
                scale = minModelScale;
            }
            if (scale && scale != modelRef.current.scale) {
                modelRef.current.scale.set(scale, scale, scale);
                modelRef.current.updateMatrix();
            }
        }
    }, [positionData]);

    return (
        <group ref={ref}>
            <primitive
                ref={modelRef}
                object={model.scene}
                scale={minModelScale}
                {...otherProps}
            />
            <axesHelper args={[20]} setColors={['red', 'green', 'blue']} />
        </group>
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
};
