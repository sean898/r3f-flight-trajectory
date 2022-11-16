import {Html} from '@react-three/drei';
import PropTypes from 'prop-types';

function Notes({notes}) {
    if (notes == null || notes.length == 0) return <></>;
    return notes.map(({x, y, z, text}, i) => (
        <mesh key={`notes=${i}`} position={[x, y, z]}>
            <Html wrapperClass="hover-info-wrapper">
                <div className="note-annotation">{text}</div>
            </Html>
        </mesh>
    ));
}

Notes.propTypes = {
    /** Note array */
    notes: PropTypes.array,
};

Notes.defaultProps = {
    notes: [],
};

export {Notes};
