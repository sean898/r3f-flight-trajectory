import {FlightPath} from '../lib';
import {useRef, useState, useEffect} from 'react';
import csvFile from './data/test.csv';
import Papa from 'papaparse';

function shifted(d) {
    const e = {...d};

    e.x += 100;
    e.z += 50;
    return e;
}

const useData = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        Papa.parse(csvFile, {
            delimiter: ',',
            download: true,
            preview: 6000,
            header: true,
            dynamicTyping: true,
            complete: (result) => {
                const dataArray = result.data;
                let data2 = new Array(...result.data);
                data2 = data2.map(shifted);
                setData(new Array(dataArray, data2));
            },
        });
    }, [csvFile]);

    return data;
};

const colorPalette = [
    [0.9, 0, 0],
    [0, 0.9, 0],
    [0, 0, 0.9],
    [0.9, 0, 0.9],
];

function App() {
    const data = useData();
    const [playing, setPlaying] = useState(false);
    const [counter, setCounter] = useState(1);
    const playbackSpeed = 1000;
    const [segmentInfo, setSegmentInfo] = useState([
        {
            start: 10,
            end: 50,
            maneuver: 'ManeuverA',
            number: 1,
            color: colorPalette[0],
        },
        {
            start: 100,
            end: 140,
            maneuver: 'ManeuverB',
            number: 1,
            color: colorPalette[1],
        },
        {
            start: 150,
            end: 160,
            maneuver: 'ManeuverA',
            number: 2,
            color: colorPalette[2],
        },
    ]);

    useEffect(() => {
        if (!playing) return;
        let interval = setInterval(() => {
            setCounter((x) => x + 1);
        }, playbackSpeed);
        return () => clearInterval(interval);
    }, [counter, playing]);

    function togglePlaying() {
        setPlaying(!playing);
    }

    return (
        <>
            <button onClick={togglePlaying}>Toggle</button>
            <FlightPath
                counter={counter}
                data={data}
                segmentInfo={segmentInfo}
                modelFile="public/F-16.glb"
                playing={playing}
                playbackSpeed={playbackSpeed}
            />
        </>
    );
}

export default App;
