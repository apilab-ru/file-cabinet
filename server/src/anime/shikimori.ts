import { Injectable } from '@nestjs/common';
import * as Shikimori from './shikikomori.js';

@Injectable()
export class ShikimoriApi {
  private nickname = 'apilab';
  private password = '4595130';
  private instance: any;

  constructor() {
    const shikimori = new Shikimori({
      nickname: this.nickname,
      password: this.password,
    }, (err, client) => {
      if (err) throw new Error(err);

      client.get('animes', {limit: 10}, (err, animes, response) => {
        let top10 = animes.map(anime => anime.name);
        console.log(top10);
      });

      client.post('messages/read_all', {type: 'news', frontend: false});
    });
  }

}
