const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const YoutubeDownloader = require('./YoutubeDownloader')

app.use(cors())
app.use(bodyParser.json())

app.get('/', async (request, response) => {
  const { url } = request.query;

  const playlist = await YoutubeDownloader.getPlaylistInfo(url);

  console.log('\n---------------------INICIANDO---------------------\n');

  if(!playlist) {
    await YoutubeDownloader.download(url);

    return response.send('ok');
  }

  for(const item of playlist.items) {
    await YoutubeDownloader.download(item.url);
  }

  console.log('\n---------------------TUDO PRONTO!!!---------------------\n');

  return response.send('ok');
})

app.listen(3000, () => {
  console.log('listening on port 3000');
})

