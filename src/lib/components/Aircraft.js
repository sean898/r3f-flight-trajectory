import {useGLTF} from '@react-three/drei';
import {useRef, useMemo} from 'react';
import modelFile from '../../assets/F-16.glb';

export default function Aircraft({position, onClick, ...otherProps}) {
    const ref = useRef();
    const model = useGLTF(modelFile, false);
    const color = 'green';
    useMemo(() => {
        model.materials['Material.002'].color.set(color);
    }, [color]);
    return (
        <primitive
            object={model.scene}
            position={position}
            scale={0.1}
            ref={ref}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            {...otherProps}
        />
    );
}
