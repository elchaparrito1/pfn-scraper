const puppeteer = require('puppeteer');
const robotsParser = require('robots-parser');
const request = require('request-promise');

const initiateCrawlers = async () => {
      const urls = [
      ['https://www.newsnow.co.uk/h/Sport/Football', '.newsfeed', '.hl a', '.hl a'],
      ['https://www.nbcsports.com/soccer', '.more-headlines__list-item', '.story__content a', '.story__content a'],
      ['https://www.skysports.com/football', '.news-list__item', 'h4 a', 'a'],
      ['https://www.goal.com/en', 'article.type-article', 'h3', 'a'],
      ['https://www.nbcsports.com/boston/misc/'],
      ['https://www.marca.com/en/football/barcelona.html?intcmp=MENUPROD&s_kw=english-barcelona', 'article.mod-futbol', 'header h3 a', 'a'],
      ['https://www.marca.com/en/football/real-madrid.html?intcmp=MENUPROD&s_kw=english-real-madrid', 'article.mod-futbol', 'header h3 a', 'a'],
      ['https://www.givemesport.com/football', '.gms-teaser', '.gms-teaser-title a', 'a'],
      ['https://www.uefa.com/uefachampionsleague/news', '.mosaic-card', 'header h2', 'a'],
      ['https://www.sportbible.com/football', '.css-1vd89ab', 'a h2', 'a']
  ];
  let newsData = [];
  let notScrapable = [];

  const checkRobotsTxt = async (robotsUrl) => {
    try {
      let pathArray = robotsUrl.split('/');
      let url = `${pathArray[0]}//${pathArray[2]}/robots.txt`;
      let robotText = await request.get(url);
     
      const robots = robotsParser(robotsUrl, robotText);
  
      return robots.isAllowed(robotsUrl, 'NewsBots')
  
    } catch(err) {
      
      return err;
    }
  }

  try {
    for (let i = 0; i < urls.length; i++) {
      if (await checkRobotsTxt(urls[i][0])) {
        const browser = await puppeteer.launch({ 
          headless: true,
          args: [
            '--no-sandbox'
          ]
      });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
      
        const url = urls[i][0];
        const data = urls[i];

        await page.goto(url, { waitUntil: 'networkidle2' });

        const results = await page.evaluate((data) => {

        const allTitles = document.querySelectorAll(data[1]);
            return [...allTitles].slice(0, 10)
              .map(title => {
                let res = {
                  site: data[0],
                  headline: title.querySelector(data[2]).innerHTML.trim(),
                  link: title.querySelector(data[3]).href
                };
          
              return res;
              
              });
              
      }, data);

      newsData.push(results);
      await browser.close();

      } else {
        notScrapable.push(urls[i][0]);
      }
    }
  } catch (err) {
   
    return err;
  }
     
  return {newsData, notScrapable}
};

const massageData = async () => {
  try {
    let news = await initiateCrawlers();
    let cantScrape = news.notScrapable;
    let massagedData = news.newsData;
    let crawlTime = new Date().toLocaleTimeString();
    
    for (const arr of massagedData) {
      arr.map((obj) => {
        switch(obj.site) {
          case 'https://www.uefa.com/uefachampionsleague/news':
              let newHeadline = obj.headline.replace(/<\/?span[^>]*>Live<\/?span[^>]*>/g,"");
              obj.headline = newHeadline.trim();
            break;
          case 'https://www.sportbible.com/football':
              obj.headline = obj.headline.replace(/<\/?span[^>]*>/g,"");
            break;
          default:
            break;
        }
      })
    }

    return {massagedData, cantScrape, crawlTime};

  } catch(err) {
    
    return `Data massage error: ${err}`;
  }
}

module.exports = massageData;



