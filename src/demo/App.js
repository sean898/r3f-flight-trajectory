import {FlightPath} from '../lib';
import {useRef, useState, useEffect} from 'react';
import csvFile from './data/test.csv';
import Papa from 'papaparse';

const useData = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        Papa.parse(csvFile, {
            delimiter: ',',
            download: true,
            preview: 500,
            header: true,
            dynamicTyping: true,
            complete: (result) => setData(result.data),
        });
    }, []);
    return data;
};

function App() {
    const data = useData();
    const [playing, setPlaying] = useState(true);
    const [counter, setCounter] = useState(1);

    useEffect(() => {
        if (!playing) return;
        let interval = setInterval(() => {
            setCounter((x) => x + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [counter, playing]);

    return <FlightPath counter={counter} data={data} />;
}

export default App;
