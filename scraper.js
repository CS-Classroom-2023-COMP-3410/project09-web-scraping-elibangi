const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
axios.get('https://bulletin.du.edu/undergraduate/coursedescriptions/comp/').then(response => {
const $ = cheerio.load(response.data);
const courses = [];
$('.courseblock').each((i,elem) => {
    const course = {};
    course.title = $(elem).find('.courseblocktitle').text();
    course.desc = $(elem).find('.courseblockdesc').text();

    // skip all the ones that have prerequisites
    if (course.desc.toLowerCase().includes('prerequisite')) return;
    // console.log(course.desc);
    //else keep looking 
    // need to find 3000 level courses
    // console.log(course.title);
    // text.replace(/&nbsp;/g, " ");
    course.title = course.title.replace(/\s+/, ' '); // removing those annoying non-breaking spaces so i can split by actual spaces
    // course.title = course.title.replace('&nbsp;', ' '); 

    // if (!course.title.includes('COMP 3')) return;
    // console.log('success');
    const name = course.title.split(' ');
    const num = name[1];
    if (num[0] !== '3') return;
    const comp = name[0];
    // console.log(comp + '-' + num);

    // gets rid of course code and gets title up to parentheses
    // getting title up to parentheses ex. (4 credits)
    const title = name.slice(2).join(' ').split(' (')[0].trim(); 
    
    // console.log(title);

    courses.push({
        code: comp + '-' + num,
        title: title
    })

    // to match exact formatting in readme
    results = {
        courses: courses
    }


    fs.writeFileSync('results/bulletin.json', JSON.stringify(results, null, 2));
    


    })
})
.catch(err => {
    console.log(err);
});

axios.get('https://denverpioneers.com/index.aspx').then(response => {
    const $ = cheerio.load(response.data);
    const events = [];
    $('script').each((i, elem) => {
        const content = $(elem).html();
        const index = content.indexOf('var obj = {');
        if (index == -1) return;
        const jsonString = content.substring(index + 9, content.indexOf('};') + 1); // +9 to get rid of "var obj =" and +1 to include the closing curly brace
        const obj = JSON.parse(jsonString);
        const games = obj.data;
        if (!Array.isArray(games)) return; // sometimes it says that the games.forEach is not a function, so this is to check if games is actually an array
        games.forEach(game => {
            if (!game.opponent) return; 
            events.push({
                duTeam: game.sport.title,
                opponent: game.opponent.name,
                date: game.date
            });
        });


    });
    // console.log(events);
    results = {
        events: events
    }
    fs.writeFileSync('results/athletic_events.json', JSON.stringify(results, null, 2));
  })
.catch(err => {
    console.log(err);
});

  axios.get('https://www.du.edu/calendar?search=&start_date=2025-01-01&end_date=2025-12-31#events-listing-date-filter-anchor').then(response => {
    const $ = cheerio.load(response.data);
    const events = [];

    $('.events-listing__item').each((i, elem) => {
        let event = {};

        const title = $(elem).find('h3').text().trim();
        const time = $(elem).find('p').eq(1).text().trim(); // second p
        const date = $(elem).find('p').first().text().trim();
        const desc = $(elem).find('p').eq(2).text().trim(); // third p
        
        event = {
            title: title,
            time: time,
        }

        if (date) {
            event.date = date;
        }

        if (desc) {
            event.desc = desc;
        }

        events.push(event);


    });
    // console.log(events);

    results = {
        events: events
    }
    fs.writeFileSync('results/calendar_events.json', JSON.stringify(results, null, 2));
  })
.catch(err => {
    console.log(err);
});
