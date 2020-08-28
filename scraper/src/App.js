import React, {useState} from 'react';
import logo from './logo.png';
import axios from 'axios';
import './App.css';

const App = () => {
  const [time, setTime] = useState(null);
  const [scrapedData, setScrapedData] = useState(null);
  const [jobStatus, setJobStatus] = useState('');
  const [cantScrape, setCantScrape] = useState(null);
  
  const scrapeData = async () => {
    setJobStatus('Scraping');

    const res = await axios.get('http://localhost:3001/api/scrape');
    
    if (res.status === 201) {
      setJobStatus('Done');
      setTime(`${new Date().toDateString()} at ${new Date().toLocaleTimeString()}`);

      setScrapedData(res.data.massagedData);
      setCantScrape(res.data.cantScrape);
    }

    if (res.status === 400) {
      setJobStatus(res.statusText);
    }
    
  }

  return (
    <div className="App">
      <div className="header">
        <img alt="company logo" src={logo}></img>
        <h1>PFN Crawler Data</h1>
        <p>Date/Time of last scrape: {time}</p>
      </div>
      <div className="bod">
        <button className="btn" onClick={() => scrapeData()}>Scrape</button>
        {
          jobStatus === 'Scraping' && 
          <h2>Scraping data...</h2>
        }
        {
          jobStatus === 'Done' && 
          <h2>Data scraped!</h2>
        }

        {
          scrapedData && 
          
          scrapedData.map((arr, index) => {
            let pathArray = arr[0].site.split('/');
            return (
              <div key={index} className="info">
                <h2>{`${pathArray[2]}/`}</h2>
                  <ul>
                {
                  arr.map((obj, index) => {
                    return (
                        <li key={index}>
                          <a href={obj.link} target='_blank' rel="noopener noreferrer">
                            {obj.headline}
                          </a>
                        </li>
                    )
                  })
                }
                  </ul>
              </div>
            )
          })
          
        }

        {
          cantScrape &&

          cantScrape.map((arr, index) => {
            return (
              <div className="info">
                <h2>Can't Scrape These URL Paths:</h2>
                  <ul>
                    <li key={index}>
                      {arr}
                    </li>
                  </ul>
              </div>
            )
          })
        }

      </div>
    </div>
  );
}

export default App;
