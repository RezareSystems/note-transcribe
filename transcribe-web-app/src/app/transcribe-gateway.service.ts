import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

export interface TranscribeGatewayResponse {
  statusCode: number;
  body: {
    [key: string]: []
  };
}

export interface TranscribeJobModel {
  name: string;
  status: string;
  jsonName: string;
  rawName: string;
  docName: string;
}


@Injectable({
  providedIn: 'root'
})
export class TranscribeGatewayService {

  constructor(private httpClient: HttpClient) { }

  getTranscriptionJobs() {
    return this.httpClient
        .get<TranscribeGatewayResponse>('https://4679kc26v3.execute-api.ap-southeast-2.amazonaws.com/Testing')
        .pipe(map(response => {
          const items: TranscribeJobModel[] = [];
          for (const key in response.body) {
            if (response.body.hasOwnProperty(key)) {
              if (key !== '') {
                const lastIndex = response.body[key].length - 1;
                const jsonN = response.body[key].find(r => (r as string).endsWith('.json'));
                const rawN = response.body[key].find(r => (r as string).endsWith('.mp3') || (r as string).endsWith('.wav'));
                const docN = response.body[key].find(r => (r as string).endsWith('docx'));
                const newItem: TranscribeJobModel = {
                   name: key,
                   status: response.body[key][lastIndex],
                   jsonName: jsonN,
                   rawName: rawN,
                   docName: docN
                };
                items.push(newItem);
              }
            }
          }
          return items;
        }));
  }
}
