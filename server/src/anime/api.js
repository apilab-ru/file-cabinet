const { Shikimori } = require("./shikikomori.js");

const shikimori = new Shikimori({
  nickname: 'apilab',
  password: '4595130',
}, (err, client) => {
  if (err) throw new Error(err);

  client.get('animes', {limit: 10}, (err, animes, response) => {
    let top10 = animes.map(anime => anime.name);
    console.log(top10);
  });

  client.post('messages/read_all', {type: 'news', frontend: false});
});
