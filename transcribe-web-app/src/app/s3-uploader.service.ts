import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class S3UploaderService {
  private readonly uploadBucketName = 'transcibe-upload-bucket';
  private readonly downloadBucketName = 'transcribe-processed-bucket';

  constructor(private http: HttpClient) {}

  uploadFile(file, key: string) {
    let contentType = 'audio/mp3';
    if (key.endsWith('.wav')) {
      contentType = 'audio/wav';
    }
    return this.http.put<any>(
      `https://f6uepd2kya.execute-api.ap-southeast-2.amazonaws.com/proxytest/${
        this.uploadBucketName
      }/${key}`,
      file,
      {
        headers: {
          'Content-Type': contentType
        }
      }
    );
  }

  downloadFile(key: string) {
    let acceptType = 'application/json';
    if (key.endsWith('.mp3')) {
      acceptType = 'audio/mp3';
    } else if (key.endsWith('.wav')) {
      acceptType = 'audio/wav';
    }
    return this.http.get(`https://f6uepd2kya.execute-api.ap-southeast-2.amazonaws.com/proxytest/${
      this.downloadBucketName
    }/${key}`, {
      headers : {
        'Accept': acceptType
      },
      responseType: 'blob'
    }).subscribe(blob => {
      saveAs(blob, key);
    });
  }
}
