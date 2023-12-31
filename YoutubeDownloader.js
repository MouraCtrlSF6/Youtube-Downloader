const ytdl = require('ytdl-core');
const ytpl = require('ytpl')
const fs = require('fs');

class YoutubeDownlaoder {

  static async download(url) {
    const music = await ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });

    const info = await YoutubeDownlaoder.getMusicInfo(music);

    const buffer = await YoutubeDownlaoder.getBufferedData(music);

    const bufferedInput = [];

    buffer.forEach((data) => bufferedInput.push(...data));

    fs.writeFile(
      `${__dirname}/download/${info.title.replace(/[^a-zA-Z0-9 ]/g,'')}.mp3`,
      Buffer.from(bufferedInput),
      (err) => console.log(err)
    );
  }

  static getBufferedData(music) {
    return new Promise((resolve) => {
      const buffer = [];

      music.on('readable', async () => {
        const chunk = await music.read();

        if(!!chunk) {
          buffer.push(chunk);
        } else {
          resolve(buffer)
        }
      });
    });
  }

  static getMusicInfo(music) {
    return new Promise((resolve) => {
      music.on('info', (info) => {
        const { formats } = info;

        const audioFormats = formats.filter((format) => {
          return format.mimeType.includes('audio/mp4');
        });

        let greatestBitrate = audioFormats[0];

        for(const audioFormat of audioFormats) {
          if(audioFormat.audioBitrate > greatestBitrate) {
            greatestBitrate = audioFormat;
          }
        }

        resolve({
          title: info.videoDetails.title,
          description: info.videoDetails.description,
          lengthSeconds: info.videoDetails.lengthSeconds,
          contentLength: parseInt(greatestBitrate.contentLength)
        });
      });
    });
  }

  static async getPlaylistInfo(url) {
    try {
      return await ytpl(url);
    } catch {
      return null;
    }
  }
}

module.exports = YoutubeDownlaoder;