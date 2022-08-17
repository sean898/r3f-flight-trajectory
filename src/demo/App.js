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
            preview: 50,
            header: true,
            dynamicTyping: true,
            complete: (result) => setData(result.data),
        });
    }, []);
    return data;
};

function App() {
    const data = useData();
    return <FlightPath data={data} />;
}

export default App;
